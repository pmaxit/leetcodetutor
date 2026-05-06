## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)

---

## Hints-Based Socratic Interview Chat Rules

**For detailed hints pattern and examples, see: HINTS_PATTERN.md**

### Data Structure
Hints are stored as JSON arrays in the `Question.hints` field in the database:
```json
[
  "Hint 1: Critical insight / problem framing (state definition, approach setup)",
  "Hint 2: Core algorithm / approach step (recurrence, transitions, logic)",
  "Hint 3: Edge cases / optimization (boundary conditions, pitfalls)"
]
```
**Maximum 3 hints per problem. Each hint is 15-20 words and follows strict pattern.**

### Chat Interaction Rules

#### 1. **Progressive Hint Disclosure**
- **Initial response**: Always start with **Hint 1** (automatic, no "I need help" required)
- **State tracking**: Session tracks `currentHintIndex` (starts at 1 after initial probe)
- **Progression**: When user asks for help, provide next hint (index 2, then 3)
- **Frequency**: One hint per request, no stacking or skipping hints
- **Session state after init**: `currentHintIndex = 1` (first hint already shown)

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
