const { OpenAI } = require("openai");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class LLMService {
  constructor() {
    console.log("Initializing LLMService with LMStudio (OpenAI-compatible)");
    this.client = new OpenAI({
      baseURL: "http://localhost:1234/v1",
      apiKey: "lm-studio", // LMStudio usually doesn't require a real key
    });
    this.model = "google/gemma-3n-e4b";
    
    this.dpSolutionsPath = path.join(__dirname, '../solutions/dp_solutions.json');
    this.sdSolutionsPath = path.join(__dirname, '../solutions/system_design.json');
    
    // Ensure directory exists
    const solutionsDir = path.dirname(this.dpSolutionsPath);
    if (!fs.existsSync(solutionsDir)) {
      fs.mkdirSync(solutionsDir, { recursive: true });
    }
    
    this.loadSolutions();
  }

  loadSolutions() {
    this.dpSolutions = fs.existsSync(this.dpSolutionsPath) ? JSON.parse(fs.readFileSync(this.dpSolutionsPath, 'utf8')) : {};
    this.sdSolutions = fs.existsSync(this.sdSolutionsPath) ? JSON.parse(fs.readFileSync(this.sdSolutionsPath, 'utf8')) : {};
  }

  fixJsonEscaping(jsonStr) {
    // Fix unescaped quotes within string values
    // Match patterns like "field": "content with "bad quotes" and fix them
    return jsonStr.replace(/"([^"]*)":\s*"((?:[^"\\]|\\.)*)"/g, (match, key, value) => {
      // Escape any unescaped quotes in the value
      const escaped = value.replace(/(?<!\\)"/g, '\\"');
      return `"${key}": "${escaped}"`;
    });
  }

  async generateContent(messagesOrPrompt) {
    const messages = typeof messagesOrPrompt === 'string' 
      ? [{ role: "user", content: messagesOrPrompt }]
      : messagesOrPrompt;

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages,
        max_tokens: 4096,
        temperature: 0,
      });

      const choice = response.choices[0];
      const content = choice.message.content || "";

      if (!content) {
        throw new Error("LLM returned empty response");
      }

      return content.trim();
    } catch (error) {
      console.error("LLM Generation Error:", error);
      throw error;
    }
  }

  async ensureSolutionExists(problemName, type = 'dp') {
    const targetSet = type === 'dp' ? this.dpSolutions : this.sdSolutions;
    const targetPath = type === 'dp' ? this.dpSolutionsPath : this.sdSolutionsPath;

    if (targetSet[problemName]) return targetSet[problemName];

    console.log(`Generating reference solution for: ${problemName}...`);
    const prompt = `
      You are a Principal Engineer. Generate a reference solution for the problem: "${problemName}".
      Type: ${type.toUpperCase()}
      
      Return a JSON object:
      ${type === 'dp' ? 
        '{ "reference": "Python code", "steps": ["step1", "step2"], "success_criteria": ["c1", "c2"] }' :
        '{ "sla": "latency/qps", "simple_design": ["comp1", "comp2"], "complex_design": ["comp3", "comp4"], "key_questions": ["q1", "q2"] }'
      }
      
      RULES:
      1. Return ONLY the JSON object.
      2. Ensure the JSON is complete and valid.
      3. Use PLAIN TEXT only in strings.
      4. STRICTLY FORBIDDEN: Do NOT use backslashes (\\), LaTeX math notation (e.g., $...$, \\land), or special escape sequences.
      5. Do NOT include any reasoning or thinking process in the output.
      6. When including code in the "reference" field, escape ALL double quotes as \\" to ensure valid JSON.
      7. Use \\n for newlines, not actual line breaks.
    `;

    try {
      const text = await this.generateContent(prompt);
      const cleanedText = text.replace(/```json|```/g, '').trim();
      try {
        const fixedText = this.fixJsonEscaping(cleanedText);
        const solution = JSON.parse(fixedText);
        targetSet[problemName] = solution;
        fs.writeFileSync(targetPath, JSON.stringify(targetSet, null, 2));
        return solution;
      } catch (parseError) {
        console.error("Failed to parse solution JSON. Raw text:", cleanedText);
        throw parseError;
      }
    } catch (error) {
      console.error("Failed to generate solution:", error);
      return {};
    }
  }

  async analyzeCode(code, context) {
    const solution = await this.ensureSolutionExists(context.problem, 'dp');
    const prompt = `
      You are a Senior Principal Engineer. Critique the following code:
      \`\`\`python
      ${code}
      \`\`\`
      
      Problem: ${context.problem || 'DP'}.
      Reference Solution Key Points: ${solution.success_criteria ? solution.success_criteria.join(', ') : 'N/A'}
      
      RULES:
      1. Be EXTREMELY concise. Maximum 15 words per message.
      2. Forget grammar/politeness. Use technical shorthand.
      3. Focus ONLY on logic flaws relative to the reference solution.
      4. Use PLAIN TEXT only. STRICTLY FORBIDDEN: Do NOT use backslashes (\\) or math notation.
      
      Format: JSON array [{ "type": "observation", "message": "..." }, ...]
    `;

    try {
      const text = await this.generateContent(prompt);
      const cleanedText = text.replace(/```json|```/g, '').trim();
      try {
        const fixedText = this.fixJsonEscaping(cleanedText);
        return JSON.parse(fixedText);
      } catch (parseError) {
        console.error("Failed to parse code analysis JSON. Raw text:", cleanedText);
        return [{ type: 'error', message: `Err: Parse failed` }];
      }
    } catch (error) {
      return [{ type: 'error', message: `Err: ${error.message}` }];
    }
  }

  async analyzeWhiteboard(shapes, context) {
    const problemName = context.problem || 'News Feed';
    const solution = await this.ensureSolutionExists(problemName, 'sd');
    
    const whiteboardText = shapes.filter(s => s.text).map(s => s.text).join(', ');
    
    const prompt = `
      You are a Senior Principal Engineer. Critique the following System Design diagram (parsed as text/shapes):
      Text detected on board: ${whiteboardText}
      
      Problem: ${problemName}
      Target SLA: ${solution.sla}
      Required High-Level Components: ${solution.complex_design.join(', ')}
      
      GOAL: 
      - Guide the user from a simple design to a complex one that meets the SLA.
      - Identify missing critical components (e.g., Cache, Load Balancer, DB Sharding).
      - Ask 1-2 sharp technical questions about bottlenecks.
      - Be concise (max 20 words per point).
      - Use PLAIN TEXT only. STRICTLY FORBIDDEN: Do NOT use backslashes (\\).
      
      Format: JSON array [{ "type": "observation", "message": "..." }, { "type": "complexity", "message": "..." }]
    `;

    try {
      const text = await this.generateContent(prompt);
      const cleanedText = text.replace(/```json|```/g, '').trim();
      try {
        const fixedText = this.fixJsonEscaping(cleanedText);
        return JSON.parse(fixedText);
      } catch (parseError) {
        console.error("Failed to parse whiteboard analysis JSON. Raw text:", cleanedText);
        return [{ type: 'error', message: `Err: Parse failed` }];
      }
    } catch (error) {
      return [{ type: 'error', message: `Design Error: ${error.message}` }];
    }
  }

  async generateChatResponse(userInput, state) {
    const problemName = state.state?.selectedQuestion?.title || 'Coin Change';
    const solution = await this.ensureSolutionExists(problemName, state.type === 'SYSTEM_DESIGN' ? 'sd' : 'dp');
    
    const systemPrompt = `
      You are a Senior Principal Engineer conducting a Technical Interview.
      Problem: ${problemName}
      Reference Context: ${JSON.stringify(solution)}
      
      PEDAGOGICAL RULES:
      1. If the user asks "what is the error" or "why is it failing", provide a HINT and a Socratic nudge. Do NOT give the full code fix.
      2. Provide the FULL SOLUTION code ONLY if the user explicitly asks for it (e.g., "show me the full solution").
      3. Use the current code provided below to pinpoint exact line numbers or logic flaws.

      INTERACTION RULES:
      1. If the user asks a technical question, answer it DIRECTLY and EXPERTLY.
      2. If the user is struggling, use the Socratic method to nudge them.
      3. FORMATTING (CRITICAL): Always use a clean, structured Markdown layout.
         - Use ### Headers to separate thoughts or sections.
         - Use Bullet points for steps or key items.
         - Use $...$ for equations.
         - Use TWO NEWLINES between paragraphs.
      4. Maintain a professional, senior engineer persona.
    `;

    const userContext = `
      CURRENT CODE (from candidate's editor):
      <user_code>
      ${state.state?.codeBuffer || 'No content yet'}
      </user_code>

      Candidate's Input: "${userInput}"
    `;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(state.state?.conversationHistory || []),
      { role: "user", content: userContext }
    ];

    try {
      return await this.generateContent(messages);
    } catch (error) {
      return "Let's analyze the current bottlenecks. How does your approach handle edge cases?";
    }
  }

  async generateInitialProbe(question) {
    const isSystemDesign = question.pattern && question.pattern.toLowerCase().includes('design');
    const solution = await this.ensureSolutionExists(question.title, isSystemDesign ? 'sd' : 'dp');
    
    const prompt = `
      You are a Senior Principal Engineer. You are starting an interview for the problem: "${question.title}".
      Pattern: ${question.pattern}
      
      Problem Context: ${JSON.stringify(solution)}
      
      GOAL: Generate a SHARP, TARGETED initial probe for this problem. 
      - If it's DSA, ask about a critical edge case, sorting assumption, or data constraint.
      - If it's System Design, ask about a critical SLA or trade-off.
      
      Do NOT be generic. Do NOT say "How would you start?".
      Be EXTREMELY concise. Maximum 15 words.
      Use PLAIN TEXT only. Do NOT use backslashes (\\).
      
      Response:
    `;

    try {
      return await this.generateContent(prompt);
    } catch (error) {
      return `Let's dive into ${question.title}. What are the primary bottlenecks you anticipate?`;
    }
  }

  async extractConstraints(userInput, currentConstraints) {
    const prompt = `
      Extract key technical constraints, requirements, or SLAs from this user message:
      "${userInput}"
      
      Existing Constraints: ${currentConstraints.join(', ')}
      
      RULES:
      1. Return a JSON array of short strings (e.g., ["QPS: 10k", "Latency < 100ms", "No negative weights"]).
      2. Only include NEW constraints mentioned.
      3. If none, return [].
      4. Only return JSON.
      5. Use PLAIN TEXT only. STRICTLY FORBIDDEN: Do NOT use backslashes (\\).
    `;

    try {
      const text = await this.generateContent(prompt);
      const cleanedText = text.replace(/```json|```/g, '').trim();
      try {
        const fixedText = this.fixJsonEscaping(cleanedText);
        return JSON.parse(fixedText);
      } catch (parseError) {
        console.error("Failed to parse constraints JSON. Raw text:", cleanedText);
        return [];
      }
    } catch (error) {
      return [];
    }
  }

  async generateReActResponse(userInput, state, scratchpad = "", hintContext = {}) {
    const problemName = state.state?.selectedQuestion?.title || 'Coin Change';
    const solution = await this.ensureSolutionExists(problemName, state.type === 'SYSTEM_DESIGN' ? 'sd' : 'dp');

    const { hints = [], currentHintIndex = 0, askingSolution = false, hintsExhausted = false } = hintContext;
    const currentHint = !hintsExhausted && currentHintIndex < hints.length ? hints[currentHintIndex] : null;

    const systemPrompt = `
      You are an Expert Interviewer and Principal Engineer. You solve problems using a Reasoning and Acting (ReAct) loop.

      Problem: ${problemName}
      Target Reference: ${JSON.stringify(solution)}

      PEDAGOGICAL RULES:
      1. HINTS-FIRST approach: Use hints to guide the student with Socratic nudges, NOT direct solutions.
      2. Current Hint (index ${currentHintIndex}): "${currentHint || 'No more hints available'}"
      3. If user asks for solution AND hints are exhausted: Provide FULL SOLUTION code.
      4. If user asks for solution BUT hints remain: Suggest showing the current hint first, then offer solution.
      5. If the user asks "what is the error" or "why is it failing", rephrase the current hint as a Socratic question.
      6. NEVER include working code in responses unless user explicitly asks for full solution.
      7. Use the current code provided below to pinpoint exact line numbers or logic flaws.
      8. Response format: Use ### Headers, bullet points, and Markdown for clarity.
      
      TOOLS AVAILABLE:
      1. SEARCH: Performs a web search for technical documentation or verification.
      2. CRITIQUE: Performs a deep technical critique of the current code/design.

      CURRENT HINT CONTEXT:
      - Hints Remaining: ${hints.length - currentHintIndex} of ${hints.length}
      - Current Hint: "${currentHint || 'No more hints'}"
      - User asking for solution: ${askingSolution}
      - Hints Exhausted: ${hintsExhausted}

      STRICT FORMAT:
      Thought: <your internal reasoning about what the user needs or what to do next>
      Action: <one of [SEARCH, CRITIQUE, NONE]>
      Action Input: <the specific search query, or the code/concept to critique>
      Observation: <the result will be provided to you in the next turn>
      ... (repeat if needed)
      Thought: I have enough information to respond to the candidate.
      Final Response: <your clean, structured, Markdown-formatted response. Use ### Headers and Bullet points.>

      USER INPUT: "${userInput}"

      REASONING HISTORY:
      ${scratchpad}

      Next Thought/Action:
    `;

    const userContext = `
      CURRENT CODE (from candidate's editor):
      <user_code>
      ${state.state?.codeBuffer || '# No code yet'}
      </user_code>

      Candidate's Input: "${userInput}"
    `;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(state.state?.conversationHistory || []),
      { role: "user", content: userContext }
    ];

    try {
      return await this.generateContent(messages);
    } catch (error) {
      return "Thought: An error occurred.\nFinal Response: I encountered an issue processing your request. How can we simplify your current approach?";
    }
  }

  async analyzeGapAndSelectGuidance(userInput, codeBuffer, referenceCode, availableHints) {
    const prompt = `
      You are an Expert Teacher and Principal Engineer. Your goal is to help a candidate solve a coding problem using Socratic hints.

      Candidate's Message: "${userInput}"
      Current Code:
      \`\`\`python
      ${codeBuffer || '# No code yet'}
      \`\`\`

      Reference Solution (The Goal):
      \`\`\`python
      ${referenceCode}
      \`\`\`

      Pre-defined Hints (Use as guidance):
      ${JSON.stringify(availableHints)}

      TASK:
      1. Analyze the DELTA between the current code and the reference solution.
      2. Identify the SINGLE most critical logical gap or misconception.
      3. Skip any hints that the candidate has already implemented or clearly understands.
      4. Select the most relevant pre-defined hint OR generate a precise Socratic nudge.
      5. CRITICAL: Do NOT give the solution code - only provide hints and questions.
      6. FORMATTING: Use rich Markdown and LaTeX.
         - Use ### Headers for sections.
         - Use Bullet points for steps.
         - Use $...$ for inline math and $$...$$ for block math.
         - Use TWO NEWLINES between paragraphs for clarity.

      EXAMPLE AESTHETIC RESPONSE:
      "### Core Recurrence
      You've correctly identified the base cases. Now, think about the state transition:
      *   $dp[i]$ represents the max profit at day $i$.
      *   Consider: What should $dp[i]$ depend on?"

      Return a JSON object:
      {
        "guidance": "Your aesthetic Markdown/LaTeX response here - NO SOLUTION CODE.",
        "logicGap": "Short description of the gap found.",
        "relevantHintIndex": index_of_hint_if_applicable_or_null
      }
    `;

    try {
      const text = await this.generateContent(prompt);
      const cleanedText = text.replace(/```json|```/g, '').trim();
      const fixedText = this.fixJsonEscaping(cleanedText);
      return JSON.parse(fixedText);
    } catch (error) {
      console.error("Gap Analysis Error:", error);
      return {
        guidance: "Think about the core transition or base case here. How should we proceed?",
        logicGap: "General stuck state.",
        relevantHintIndex: null
      };
    }
  }
}

module.exports = new LLMService();
