/**
 * Base Agent class for common LLM interaction logic
 */
class BaseAgent {
  constructor(persona) {
    this.persona = persona;
  }

  /**
   * Placeholder for LLM call
   * In a real implementation, this would call Gemini/GPT-4
   */
  async generateResponse(context, userInput) {
    console.log(`[${this.constructor.name}] Generating response for: ${userInput}`);
    // Mock response for now
    return `Socratic hint based on ${userInput}`;
  }

  /**
   * Format the system prompt with persona and context
   */
  _getSystemPrompt(context) {
    return `
      Persona: ${this.persona}
      Context: ${JSON.stringify(context)}
      Rules: Follow Socratic method. Never give direct answers.
    `;
  }
}

module.exports = BaseAgent;
