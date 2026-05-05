const BaseAgent = require('./BaseAgent');

class ProctorAgent extends BaseAgent {
  constructor() {
    super('Technical Code Validator. Observant and precise.');
  }

  async analyzeCode(code, language = 'python') {
    const findings = [];
    if (!code) return findings;

    // Pattern: DP State Initialization
    if (code.includes('dp =') && (code.includes('float(\'inf\')') || code.includes('0'))) {
      findings.push({
        type: 'observation',
        message: 'I see you initializing the DP table. Why did you choose float("inf") as the default value here?'
      });
    }

    // Pattern: Nested Loop for Coin Change
    if (code.includes('for coin in coins') && code.includes('for i in range')) {
      findings.push({
        type: 'complexity',
        message: 'The nested loop structure suggests an O(Amount * N) complexity. Is this the most optimal approach, or can we reduce the space complexity further?'
      });
    }

    // Pattern: Missing Base Case
    if (code.includes('dp[i] =') && !code.includes('dp[0] = 0')) {
      findings.push({
        type: 'error',
        message: 'Wait, I don\'t see a base case for amount 0. What happens when the amount to make is exactly 0?'
      });
    }

    // Pattern: Generic Style
    if (code.includes('print(')) {
      findings.push({
        type: 'style',
        message: 'Consider removing print statements for the final implementation.'
      });
    }

    return findings;
  }
}

module.exports = ProctorAgent;
