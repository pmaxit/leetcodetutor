const LLMService = require('../services/LLMService');
const SearchService = require('../services/SearchService');
const fs = require('fs');
const path = require('path');

class InterviewerAgent {
  constructor() {
    this.persona = 'Expert Teacher and Senior Principal Engineer. Your goal is to help students solve problems in MINIMAL steps through high-signal Socratic nudges. You are concise, precise, and never redundant. You use Markdown and LaTeX for rich communication.';
    this.MAX_ITERATIONS = 5;
  }

  async generateResponse(state, userInput, onProgress = () => {}) {
    const question = state.state?.selectedQuestion;
    const hints = question?.hints || [];
    const codeBuffer = state.state?.codeBuffer || '';
    const currentHintIndex = state.state?.currentHintIndex || 0;

    const askingSolution = /show.*solution|give.*code|i give up|@showsolution/i.test(userInput);
    const hintsExhausted = currentHintIndex >= hints.length;
    const currentHint = !hintsExhausted ? hints[currentHintIndex] : null;

    console.log(`Starting agentic loop for: ${question?.title || 'Unknown'}`);
    console.log(`Hints available: ${hints.length}, Current index: ${currentHintIndex}`);
    onProgress('Thinking...');

    try {
      const { callModel, tool, stepCountIs } = await import('@openrouter/agent');
      const { OpenRouter } = await import('@openrouter/sdk');
      const { z } = await import('zod');

      const apiKey = process.env.OPENROUTER_API_KEY || process.env.LLM_API_KEY || "sk-or-v1-";
      const client = new OpenRouter({ apiKey });
      const localClient = process.env.LM_STUDIO_URL ? new OpenRouter({ apiKey: process.env.LM_STUDIO_KEY, baseURL: process.env.LM_STUDIO_URL }) : null;
      
      const searchTool = tool({
        name: 'search',
        description: 'Search for technical documentation or concept verification',
        inputSchema: z.object({
          query: z.string().describe('What to search for')
        }),
        outputSchema: z.object({
          results: z.string()
        }),
        execute: async ({ query }) => {
          onProgress(`Searching: ${query}...`);
          try {
            const results = await SearchService.performSearch(query);
            return { results };
          } catch (e) {
            return { results: `Error executing search: ${e.message}` };
          }
        }
      });

      const critiqueTool = tool({
        name: 'critique',
        description: 'Perform deep technical critique of the candidate code',
        inputSchema: z.object({
          problem: z.string().describe('Problem name for context')
        }),
        outputSchema: z.object({
          results: z.string()
        }),
        execute: async ({ problem }) => {
          onProgress('Critiquing code...');
          try {
            const critique = await LLMService.analyzeCode(codeBuffer, { problem });
            return { results: JSON.stringify(critique) };
          } catch (e) {
            return { results: `Error executing critique: ${e.message}` };
          }
        }
      });

      const agentPromptPath = path.join(__dirname, '../prompts/agent.md');
      let basePrompt = '';
      if (fs.existsSync(agentPromptPath)) {
        basePrompt = fs.readFileSync(agentPromptPath, 'utf8');
      } else {
        basePrompt = "You are an Expert Interviewer and Principal Engineer.";
      }

      const systemPrompt = `
${basePrompt}

----------------------------------
📌 CURRENT CONTEXT
----------------------------------
Problem: ${question?.title || 'Unknown'}

PEDAGOGICAL RULES (STRICT):
1. CURRENT HINT (index ${currentHintIndex}): ${currentHint ? `Use this hint for your nudge: "${currentHint.replace(/"/g, '\\"')}"` : "'No more hints. If they are finished, tell them to run the tests.'"}
2. If user asks for solution AND hints are exhausted: Provide the code. Otherwise, decline politely and give a nudge.
3. NO REDUNDANCY: Do not repeat what the user said or what you've already said.
`;

      const userContext = `
CURRENT CODE (from candidate's editor):
<user_code>
${codeBuffer || '# No code yet'}
</user_code>

Candidate's Input: "${userInput.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"
`;
      
      const pastMessages = (state.state?.conversationHistory || []).map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : msg.role === 'user' ? 'user' : 'system',
        content: msg.content
      }));

      const modelName = process.env.LLM_MODEL || LLMService.model;

      const inputItems = [
        { role: 'system', content: systemPrompt },
        ...pastMessages,
        { role: 'user', content: userContext }
      ];

      const enableTools = process.env.LLM_ENABLE_TOOLS === 'true';
      let finalText = '';
      let successModelId = null;
      let lastError = null;

      // Use the sequence defined in LLMService (which comes from .env)
      for (let i = 0; i < LLMService.modelSequence.length; i++) {
        const { id: modelId, provider } = LLMService.modelSequence[i];
        const activeClient = (provider === 'local' && localClient) ? localClient : client;

        onProgress(`Trying ${modelId}...`, modelId);
        console.log(`🔄 [Agent] Attempting ${modelId} via ${provider === 'local' ? 'LM Studio' : 'OpenRouter'}...`);

        try {
          if (enableTools) {
            console.log(`🛠️ Tool calling enabled for ${modelId}.`);
            const result = callModel(activeClient, {
              model: modelId,
              input: inputItems,
              tools: [searchTool, critiqueTool],
              stopWhen: stepCountIs(5)
            });
            finalText = await result.getText();
          } else {
            console.log(`📝 Standard completion for ${modelId}.`);
            const result = callModel(activeClient, {
              model: modelId,
              input: inputItems
            });
            finalText = await result.getText();
          }

          if (finalText) {
            console.log(`✅ Success with ${modelId}`);
            successModelId = modelId;
            break;
          }
        } catch (apiError) {
          lastError = apiError;
          console.warn(`❌ Error with ${modelId}: ${apiError.message}`);
          
          if (enableTools && (apiError.status === 404 || apiError.message?.includes('tool use'))) {
            console.warn(`Fallback to non-tool call for ${modelId}...`);
            try {
              const fallbackResult = callModel(client, {
                model: modelId,
                input: inputItems
              });
              finalText = await fallbackResult.getText();
              if (finalText) break;
            } catch (innerError) {
              console.error(`Inner error with ${modelId}: ${innerError.message}`);
            }
          }
          console.log("⏭️ Trying next model in agent sequence...");
        }
      }

      if (!finalText && lastError) {
        throw lastError;
      } else if (!finalText) {
        throw new Error("All models failed to return a response.");
      }
      let nextHintIndex = currentHintIndex;
      
      if (!askingSolution && !hintsExhausted && /hint|nudge|consider|think about/i.test(finalText)) {
        nextHintIndex = Math.min(currentHintIndex + 1, hints.length);
      }

      console.log(`✅ Agentic response generated (${finalText.length} chars)`);
      return {
        text: finalText.trim(),
        nextHintIndex,
        model: successModelId
      };

    } catch (error) {
      console.error('Agentic loop error:', error.message);
      return {
        text: "I encountered an issue processing your request. How can we simplify your current approach?",
        nextHintIndex: currentHintIndex
      };
    }
  }

  async generateInitialProbe(question) {
    const hints = question?.hints || [];

    // If hints are available, use the first hint as the initial probe
    if (hints.length > 0) {
      return {
        text: `### Initial Guidance\n\n${hints[0]}`,
        nextHintIndex: 1  // Mark first hint as shown
      };
    }

    // Fallback: Generate initial probe from LLM
    const probeText = await LLMService.generateInitialProbe(question);
    return {
      text: probeText,
      nextHintIndex: 0
    };
  }
}

module.exports = InterviewerAgent;
