const LLMService = require('../services/LLMService');
const SearchService = require('../services/SearchService');

class InterviewerAgent {
  constructor() {
    this.persona = 'Expert Teacher and Senior Principal Engineer. Your goal is to help students solve problems in MINIMAL steps through high-signal Socratic nudges. You are concise, precise, and never redundant. You use Markdown and LaTeX for rich communication.';
    this.MAX_ITERATIONS = 5;
  }

  async generateResponse(state, userInput, onProgress = () => {}) {
    const question = state.state?.selectedQuestion;
    const hints = question?.hints || [];
    const codeBuffer = state.state?.codeBuffer || '';
    const referenceCode = question?.python_code || '';
    const currentHintIndex = state.state?.currentHintIndex || 0;

    // Check if user is explicitly asking for the solution
    const askingSolution = /show.*solution|give.*code|i give up|@showsolution/i.test(userInput);
    const hintsExhausted = currentHintIndex >= hints.length;

    console.log(`Starting ReAct loop for: ${question?.title || 'Unknown'}`);
    console.log(`Hints available: ${hints.length}, Current index: ${currentHintIndex}`);
    onProgress('Thinking...');

    let scratchpad = "";
    let iterations = 0;
    let nextHintIndex = currentHintIndex;

    while (iterations < this.MAX_ITERATIONS) {
      iterations++;

      const llmOutput = await LLMService.generateReActResponse(
        userInput,
        state,
        scratchpad,
        {
          hints,
          currentHintIndex,
          askingSolution,
          hintsExhausted
        }
      );
      scratchpad += llmOutput + "\n";

      console.log("\n" + "=".repeat(60));
      console.log("🔍 ReAct Output Parsing");
      console.log("=".repeat(60));
      console.log(`📝 LLM Output (first 300 chars):\n${llmOutput.substring(0, 300)}`);
      console.log("=".repeat(60));

      // Parse LLM Output
      const thoughtMatch = llmOutput.match(/Thought:\s*(.*)/i);
      const actionMatch = llmOutput.match(/Action:\s*(\w+)/i);
      const actionInputMatch = llmOutput.match(/Action Input:\s*(.*)/i);
      const finalResponseMatch = llmOutput.match(/Final Response:\s*([\s\S]*)/i);

      console.log(`✅ Thought found: ${!!thoughtMatch}`);
      console.log(`✅ Action found: ${!!actionMatch} (${actionMatch ? actionMatch[1] : 'N/A'})`);
      console.log(`✅ Action Input found: ${!!actionInputMatch}`);
      console.log(`✅ Final Response found: ${!!finalResponseMatch}`);
      console.log("=".repeat(60) + "\n");

      const thought = thoughtMatch ? thoughtMatch[1] : "";
      const action = actionMatch ? actionMatch[1].toUpperCase() : "NONE";
      const actionInput = actionInputMatch ? actionInputMatch[1] : "";

      if (thought) {
        onProgress(`Thought: ${thought}`);
      }

      if (finalResponseMatch) {
        // Increment hint index if a hint was shown (and not asking for solution)
        if (!askingSolution && !hintsExhausted && /hint|nudge|consider|think about/i.test(finalResponseMatch[1])) {
          nextHintIndex = Math.min(currentHintIndex + 1, hints.length);
        }

        return {
          text: finalResponseMatch[1].trim(),
          nextHintIndex
        };
      }

      // If no strict ReAct format found, use the LLM output directly (it's already helpful!)
      if (iterations >= this.MAX_ITERATIONS) {
        console.log("✨ Using LLM output directly (ReAct format not required for good responses)");

        // Increment hint index if a hint was shown
        if (!askingSolution && !hintsExhausted && /hint|nudge|consider|think about/i.test(llmOutput)) {
          nextHintIndex = Math.min(currentHintIndex + 1, hints.length);
        }

        return {
          text: llmOutput.trim(),
          nextHintIndex
        };
      }

      if (action === "SEARCH" && actionInput) {
        onProgress(`Searching: ${actionInput}...`);
        const result = await SearchService.performSearch(actionInput);
        scratchpad += `Observation: ${result}\n`;
      } else if (action === "CRITIQUE") {
        onProgress(`Critiquing design...`);
        const critique = await LLMService.analyzeCode(codeBuffer, { problem: question?.title });
        scratchpad += `Observation: ${JSON.stringify(critique)}\n`;
      } else {
        // No valid action, but we have a response - use it!
        if (!finalResponseMatch && llmOutput.trim().length > 20) {
          console.log("✨ Direct response (no ReAct markers found, but response is valid)");
          if (!askingSolution && !hintsExhausted && /hint|nudge|consider|think about/i.test(llmOutput)) {
            nextHintIndex = Math.min(currentHintIndex + 1, hints.length);
          }
          return {
            text: llmOutput.trim(),
            nextHintIndex
          };
        }
      }
    }

    // Final fallback - only if we have nothing else
    console.log("⚠️ Using generic fallback response");
    return {
      text: "Let's take a step back and look at the core logic. What are our main constraints here?",
      nextHintIndex
    };
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
