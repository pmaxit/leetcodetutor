const { SUCCESS_CRITERIA } = require('../constants/Phases');

class StateManager {
  constructor(type) {
    this.type = type; // 'SYSTEM_DESIGN' or 'DSA'
    this.currentPhase = 'INITIALIZATION';
    this.state = {
      requirements: [],
      constraints: {},
      architecturalGraph: { nodes: [], edges: [] },
      codeBuffer: '',
      conversationHistory: [],
      currentHintIndex: 0,
      successMetrics: {
        questionsAsked: 0,
        componentsDrawn: 0,
        patternsIdentified: []
      }
    };
  }

  /**
   * Add a message to the conversation history
   */
  addMessage(role, content) {
    this.state.conversationHistory.push({ role, content });
    // Limit history to last 20 messages to keep context manageable
    if (this.state.conversationHistory.length > 20) {
      this.state.conversationHistory.shift();
    }
  }

  /**
   * Transition to the next phase if criteria are met
   */
  transitionTo(nextPhase) {
    const criteria = SUCCESS_CRITERIA[this.currentPhase];
    
    if (criteria) {
      const isMet = this._verifyCriteria(criteria);
      if (!isMet) {
        throw new Error(`Cannot transition to ${nextPhase}. Success criteria for ${this.currentPhase} not met.`);
      }
    }

    console.log(`Transitioning from ${this.currentPhase} to ${nextPhase}`);
    this.currentPhase = nextPhase;
    return true;
  }

  /**
   * Update state based on agent observations or user input
   */
  updateState(update) {
    this.state = { ...this.state, ...update };
    console.log('State updated:', this.state);
  }

  /**
   * Internal verification logic
   */
  _verifyCriteria(criteria) {
    // Simple verification for now
    if (this.currentPhase === 'REQUIREMENTS_GATHERING') {
      return this.state.requirements.length >= (criteria.minQuestions || 0);
    }
    // Add more verification logic as we implement agents
    return true;
  }

  /**
   * Get current session summary
   */
  getSummary() {
    return {
      type: this.type,
      phase: this.currentPhase,
      state: this.state
    };
  }
}

module.exports = StateManager;
