const LLMService = require('../services/LLMService');

class ScorerAgent {
  constructor() {
    this.persona = 'Principal Evaluation Engine. Objective, analytical, and concise.';
  }

  async generateReport(session) {
    const { state, phase } = session;
    
    const scores = {
      communication: this._scoreCommunication(state),
      depth: this._scoreDepth(state),
      complexity: this._scoreComplexity(state),
      correctness: this._scoreCorrectness(state)
    };

    const totalScore = Math.round(
      (scores.correctness * 0.3) + 
      (scores.depth * 0.3) + 
      (scores.complexity * 0.2) + 
      (scores.communication * 0.2)
    );

    const critique = await this._generateLLMCritique(scores, state);

    return {
      totalScore,
      rubric: scores,
      critique,
      recommendation: totalScore >= 80 ? 'Strong Hire' : totalScore >= 60 ? 'Hire' : 'No Hire',
      timestamp: new Date().toISOString()
    };
  }

  _scoreCommunication(state) {
    const reqCount = state.requirements ? state.requirements.length : 0;
    if (reqCount >= 5) return 100;
    if (reqCount >= 3) return 80;
    if (reqCount >= 1) return 50;
    return 20;
  }

  _scoreDepth(state) {
    let score = 50;
    if (state.architecturalGraph?.nodes?.length > 0) score += 20;
    if (state.requirements?.some(r => r.toLowerCase().includes('scale'))) score += 20;
    return Math.min(score, 100);
  }

  _scoreComplexity(state) {
    const code = state.codeBuffer || '';
    if (!code) return 0;
    // Heuristic for O(N) or better in common DP/Graph problems
    if (code.includes('dp') || code.includes('memo') || code.includes('queue')) return 90;
    return 60;
  }

  _scoreCorrectness(state) {
    return state.codeBuffer && state.codeBuffer.length > 50 ? 80 : 40;
  }

  async _generateLLMCritique(scores, state) {
    const prompt = `
      You are a Principal Engineer. Provide a CONCISE, 2-3 sentence performance critique for a candidate.
      Scores: ${JSON.stringify(scores)}
      Context: ${state.selectedQuestion?.title || 'Unknown Problem'}
      Code: ${state.codeBuffer.substring(0, 500)}
      
      RULES:
      1. Technical and direct. 
      2. High bar. 
      3. Max 50 words.
    `;

    try {
      return await LLMService.generateContent(prompt);
    } catch (error) {
      return "The candidate reached a functional solution but lacks depth in edge case handling.";
    }
  }
}

module.exports = ScorerAgent;
