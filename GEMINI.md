## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)

---

## Hints-Based Socratic Interview Chat Rules

### Data Structure
Hints are stored as JSON arrays in the `Question.hints` field in the database:
```json
[
  "Consider the constraint: What are the bounds of n?",
  "Think about the state transitions: What does dp[i] represent?",
  "Review your base cases: Are they correctly initialized?",
  "Check for off-by-one errors in indexing"
]
```

### Chat Interaction Rules

#### 1. **Progressive Hint Disclosure**
- **Default behavior**: Always start with Socratic nudges using available hints
- **State tracking**: Maintain `currentHintIndex` in session state
- **Progression**: When user asks for help, provide the next hint (don't skip)
- **Frequency**: Show one hint per "I need help" request, no hint stacking

#### 2. **Hint Usage in LLM Prompts**
The LLM must:
- Access the hints array from the question object
- Use hint[currentHintIndex] to craft a Socratic response
- Rephrase hints naturally without revealing the solution
- Focus on the gap identified by the hint, not the gap itself

#### 3. **Solution Disclosure Rules**
Show FULL SOLUTION code only when:
- User explicitly asks: "show me the solution", "give me the code", "I give up"
- Current hint index >= hints.length (user has exhausted all hints)
- User explicitly requests: `@showsolution`

Otherwise:
- Always provide Socratic nudges + hint-driven guidance
- Never include working code in responses (pseudocode OK)
- Explain WHY hints matter, not the implementation

#### 4. **Chat Response Structure**
```
Socratic Response:
### Current Gap
[Identify the specific gap from the hint]

### Nudge
[Socratic question or direction, rephrased from hint]

### Next Steps
[What to try next without spoiling it]

[IF hints exhausted]:
Ready to see the full solution? Ask "show solution" or type @showsolution.
```

#### 5. **Tracking Hint Usage**
- Increment `currentHintIndex` after each hint is shown
- Log which hints were used in conversation history
- Reset hints if user restarts a problem
- Surface hint effectiveness: did user solve after hint N?

#### 6. **Edge Cases**
- **Ambiguous requests** ("I'm stuck", "help"): Show current hint, don't advance
- **Multiple questions in one message**: Address the main blocker first
- **Hints missing**: Fallback to reference solution's `success_criteria` instead
- **Invalid hint index**: Clamp to bounds or fallback to full solution

---
