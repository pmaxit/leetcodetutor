const LLMService = require('../services/LLMService');
const SearchService = require('../services/SearchService');
const fs = require('fs');
const path = require('path');
const { getOriginalSolutionSectionsForQuestion } = require('../utils/sdSolutionSections');

const isSystemDesignQuestion = (question, sessionType) => {
  if (!question) return sessionType === 'SYSTEM_DESIGN';
  const category = (question.category || question.pattern || '').toString().toLowerCase();
  if (category.includes('system design')) return true;
  return sessionType === 'SYSTEM_DESIGN';
};

const truncate = (text, max) => {
  if (!text) return '';
  return text.length > max ? `${text.substring(0, max)}\n... (truncated)` : text;
};

const loadPromptFile = (...candidates) => {
  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      try {
        return fs.readFileSync(candidate, 'utf8');
      } catch (err) {
        console.warn(`Could not read prompt file ${candidate}: ${err.message}`);
      }
    }
  }
  return '';
};

class InterviewerAgent {
  constructor() {
    this.persona = 'Expert Teacher and Senior Principal Engineer. Your goal is to help students solve problems in MINIMAL steps through high-signal Socratic nudges. You are concise, precise, and never redundant. You use Markdown and LaTeX for rich communication.';
    this.MAX_ITERATIONS = 5;
  }

  async streamCompletion(messages, modelId, provider, onToken = () => {}) {
    const client = LLMService.clients?.[provider];
    if (!client) {
      throw new Error(`Streaming client not configured for provider: ${provider}`);
    }

    const stream = await client.chat.completions.create({
      model: modelId,
      messages,
      max_tokens: 4096,
      temperature: 0,
      stream: true,
    });

    let fullText = '';
    for await (const chunk of stream) {
      const delta = chunk?.choices?.[0]?.delta?.content || '';
      if (!delta) continue;
      fullText += delta;
      onToken(delta);
    }

    return fullText.trim();
  }

  async generateResponse(state, userInput, onProgress = () => {}, onToken = () => {}) {
    const question = state.state?.selectedQuestion;
    const sessionType = state.type;
    const isSD = isSystemDesignQuestion(question, sessionType);

    const hints = question?.hints || [];
    const codeBuffer = state.state?.codeBuffer || '';
    const currentHintIndex = state.state?.currentHintIndex || 0;
    const sdContext = state.state?.sdContext || null;

    const askingSolution = /show.*solution|give.*code|i give up|@showsolution/i.test(userInput);
    const hintsExhausted = currentHintIndex >= hints.length;
    const currentHint = !hintsExhausted ? hints[currentHintIndex] : null;

    console.log(`Starting agentic loop for: ${question?.title || 'Unknown'} (mode: ${isSD ? 'SD' : 'DSA'})`);
    if (!isSD) {
      console.log(`Hints available: ${hints.length}, Current index: ${currentHintIndex}`);
    }
    onProgress('Thinking...');

    try {
      const { callModel, tool, stepCountIs } = await import('@openrouter/agent');
      const { OpenRouter } = await import('@openrouter/sdk');
      const { z } = await import('zod');

      const apiKey = process.env.APP_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || process.env.LLM_API_KEY || "sk-or-v1-";
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

      // ─── Prompt selection (DSA vs SD) ───────────────────────────────────────
      const promptsDir = path.join(__dirname, '../prompts');
      const sdPromptPath = path.join(promptsDir, 'agent-sd.md');
      const dsaPromptPath = path.join(promptsDir, 'agent-dsa.md');
      const legacyPromptPath = path.join(promptsDir, 'agent.md');

      const basePrompt = isSD
        ? loadPromptFile(sdPromptPath, legacyPromptPath) || 'You are a Senior Principal Engineer conducting a system design interview.'
        : loadPromptFile(dsaPromptPath, legacyPromptPath) || 'You are an Expert Interviewer and Principal Engineer.';

      // ─── Build system prompt + user context per mode ───────────────────────
      let systemPrompt = '';
      let userContext = '';

      if (isSD) {
        const stages = sdContext?.stages || [];
        const currentStage = sdContext?.currentStage || null;

        let originalSection = '';
        if (question && currentStage?.id) {
          const sections = getOriginalSolutionSectionsForQuestion(question);
          if (sections && sections[currentStage.id]) {
            originalSection = sections[currentStage.id];
          }
        }

        const stageList = stages.length
          ? stages.map(s => `- ${s.id}. ${s.name}`).join('\n')
          : '- (No stage list provided)';

        const referenceAnswer = currentStage?.referenceAnswer
          ? truncate(JSON.stringify(currentStage.referenceAnswer, null, 2), 2000)
          : 'Not provided.';

        const stagePrompt = currentStage?.prompt || 'Open-ended discussion across the design.';

        const whiteboardText = (sdContext?.whiteboardText || '').trim();

        systemPrompt = `
${basePrompt}

----------------------------------
📌 SYSTEM DESIGN CONTEXT
----------------------------------
Problem: ${question?.title || 'Unknown'}
Difficulty: ${question?.difficulty || 'Unknown'}

Interview Stages:
${stageList}

Current Stage: ${currentStage ? `${currentStage.id}. ${currentStage.name}` : 'General discussion'}

Current Stage Prompt (what the candidate is being asked):
"""
${stagePrompt}
"""

Reference Stage Answer (key points the staff-level candidate should cover):
${referenceAnswer}

Original Solution Section (ground truth from the problem write-up):
"""
${truncate(originalSection || 'Not available for this stage.', 6000)}
"""

Whiteboard Text (what the candidate has drawn so far):
"""
${truncate(whiteboardText || 'Empty.', 1500)}
"""

Operational rules:
- Treat the Original Solution Section as ground truth; never contradict it without naming the trade-off explicitly.
- Stay scoped to the Current Stage unless the candidate explicitly asks about another stage.
- Always end with at most ONE focused probe.
- Never ask for code, never reference hint indices, never refer to a code editor.
`;

        userContext = `Candidate's Input: "${userInput.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
      } else {
        systemPrompt = `
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

        userContext = `
CURRENT CODE (from candidate's editor):
<user_code>
${codeBuffer || '# No code yet'}
</user_code>

Candidate's Input: "${userInput.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"
`;
      }

      const pastMessages = (state.state?.conversationHistory || []).map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : msg.role === 'user' ? 'user' : 'system',
        content: msg.content
      }));

      const inputItems = [
        { role: 'system', content: systemPrompt },
        ...pastMessages,
        { role: 'user', content: userContext }
      ];

      // SD mode does not benefit from the code-critique tool. Disable both tools for SD.
      const enableTools = !isSD && (process.env.APP_LLM_ENABLE_TOOLS === 'true' || process.env.LLM_ENABLE_TOOLS === 'true');
      let finalText = '';
      let successModelId = null;
      let lastError = null;

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
            // Prefer true token streaming when tools are disabled.
            finalText = await this.streamCompletion(inputItems, modelId, provider, onToken);
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

      // SD mode never advances hint index; DSA keeps existing behavior.
      let nextHintIndex = currentHintIndex;
      if (!isSD && !askingSolution && !hintsExhausted && /hint|nudge|consider|think about/i.test(finalText)) {
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
      const fallback = isSD
        ? "I hit an issue processing that. Could you restate the design choice you want to discuss (e.g., 'Why X over Y?')?"
        : "I encountered an issue processing your request. How can we simplify your current approach?";
      return {
        text: fallback,
        nextHintIndex: currentHintIndex
      };
    }
  }

  async generateInitialProbe(question, sessionType = null) {
    const isSD = isSystemDesignQuestion(question, sessionType);

    if (isSD) {
      const title = question?.title || 'this system';
      const probe = `### Welcome to the System Design Interview\n\nWe will work through this design stage by stage: functional requirements, non-functional requirements, core entities, API, high-level design, and deep dives.\n\n**Probe:** For ${title}, what is the single most critical non-functional requirement you would commit to in the first five minutes, and why?`;
      return {
        text: probe,
        nextHintIndex: 0
      };
    }

    const hints = question?.hints || [];

    if (hints.length > 0) {
      return {
        text: `### Initial Guidance\n\n${hints[0]}`,
        nextHintIndex: 1
      };
    }

    const probeText = await LLMService.generateInitialProbe(question);
    return {
      text: probeText,
      nextHintIndex: 0
    };
  }
}

module.exports = InterviewerAgent;
