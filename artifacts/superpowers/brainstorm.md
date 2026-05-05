# Brainstorm: AI Interview Preparation Platform

## Goal
Build a high-fidelity, adversarial, and Socratic AI interview platform that simulates FAANG/Tier-1 senior-level interviews for System Design and DSA, focusing on process over just execution. The platform will utilize a multi-agent architecture (Interviewer, Architect, Proctor, Scorer) to provide a rigorous and educational experience.

## Constraints
- **Socratic Only**: AI must never provide direct answers; it must use the "minimum effective hint" to guide the user.
- **Phase-Driven Transitions**: Interviews must progress through predefined phases (e.g., Requirements -> High-Level Design -> Deep Dive). Jumping ahead is penalized.
- **High-Fidelity Feedback**: Grading must be evidence-based, using rubrics and AST/Code execution data, not just LLM sentiment.
- **Secure Sandbox**: All user code must run in an isolated environment (Docker/gVisor) with no network access.
- **UI Aesthetics**: Premium, minimalist dark mode (Slate greys, high-quality typography) to minimize distraction and maximize focus.
- **Low Latency**: Streaming responses < 500ms for conversational fluidness.

## Known context
- **PRD**: [AI_Interview_Platform_PRD.md](file:///home/puneet/Projects/interviews/machine-learning/AI_Interview_Platform_PRD.md) defines the vision, core flows, and MVP scope.
- **Behavioral Rules**: [AGENTS.md](file:///home/puneet/Projects/interviews/machine-learning/AGENTS.md) specifies the personas and operational logic for the four core agents.
- **Target Audience**: Senior/Principal engineers (L5-L7+) aiming for Tier-1 tech roles.

## Risks
- **The "Yes-Man" AI**: The LLM might default to being helpful and agreeable, failing to push back on suboptimal architectural choices or brute-force code.
- **Diagram Interpretation**: Messy whiteboard sketches might lead to semantic errors in the Architect agent's graph representation.
- **Phase Frustration**: Users might find the strict phase-gate logic restrictive if they have a non-linear problem-solving style.
- **Hallucinated Rubrics**: The Scorer might hallucinate mistakes or complexity issues that don't exist in the user's actual output.

## Options (3)
1. **Option A: The "Text-First" MVP**
   - Focus: DSA Coding Flow + Text-based System Design.
   - Implementation: Whiteboard is present but not "smart". User must type descriptions of their components.
   - Pro: Fastest time to market, lowest technical risk.
   - Con: Lacks the "WOW" factor of real-time diagram understanding.

2. **Option B: The "Visual-First" Architect**
   - Focus: System Design whiteboard-to-graph pipeline.
   - Implementation: Heavily invest in Vision-Language Model (VLM) integration to parse strokes in real-time.
   - Pro: Massive differentiator; truly simulates a physical whiteboard interview.
   - Con: High technical complexity; VLM latency might exceed the 500ms goal.

3. **Option C: The "Agentic Suite" Hybrid (Recommended)**
   - Focus: The "Success Criteria" State Machine.
   - Implementation: Build a shared state manager that tracks phase transitions for both DSA and System Design. Use AST parsing for the Proctor and simple NLP for the Interviewer's requirement gathering.
   - Pro: Validates the core Socratic and adversarial logic across all use cases. Balances technical risk with user value.

## Recommendation
**Option C: The "Agentic Suite" Hybrid**
This approach ensures that the platform's core value—the **interactive, Socratic process**—is solid before adding heavy-weight features like real-time vision. By focusing on the `Success Criteria` loop (Verify -> Probe -> Evaluate), we build a foundation that can support both coding and architectural interviews with high rigor.

## Acceptance criteria
1. **Phase Enforcement**: The Interviewer agent prevents code implementation until the user has gathered Functional and Non-Functional requirements.
2. **Socratic Guardrails**: 100% of AI-generated hints are questions or constraint-based probes, verified by a "Socratic validator" layer.
3. **AST Validation**: The Proctor agent identifies an $O(N^2)$ solution vs. an $O(N)$ solution using AST patterns rather than just execution time.
4. **Semantic State**: Drawing a box and labeling it "Load Balancer" updates a JSON graph in the backend that the Interviewer can reference.
5. **Secure Execution**: Code execution fails immediately if it attempts unauthorized system calls or network access.
6. **Premium Report**: Post-interview feedback is generated in Markdown with specific evidence-linked scores (e.g., "Communication: 4/5 - Proactively asked about data consistency").
