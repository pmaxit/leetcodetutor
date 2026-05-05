# Product Requirements Document: AI-Powered Interview Preparation Platform

## 1. Product Overview

### Vision
To create the definitive, AI-driven mock interview platform that simulates the rigor, depth, and interactivity of FAANG/Tier-1 principal-level interviews. The platform transforms interview prep from passive problem-solving into active, Socratic dialogue, enabling engineers to hone their pattern recognition and structural thinking.

### Problem Statement
Senior and principal engineers lack a high-fidelity environment to practice System Design and advanced algorithmic coding. Existing platforms (like LeetCode) test code correctness in isolation, ignoring the interactive communication, requirements gathering, and tradeoff discussions critical to senior-level interviews. Current prep methods rely heavily on expensive human mock interviews or passive video consumption.

### Target Users
- **Senior Engineers (L5/L6)** aiming to upskill into staff/principal roles, needing to demonstrate strong system-level trade-off analysis.
- **Principal Engineers (L7+)** preparing for high-stakes interviews, looking to brush up on specific architectural patterns and algorithm edge cases.
- **Candidates targeting Tier-1 Tech** who need an environment that penalizes jumping straight to code and rewards Socratic problem-solving.

---

## 2. Core User Flows

### A. System Design Flow
**Objective:** Architect a scalable system starting from ambiguous requirements.

1. **Initialization:** The AI presents an ambiguous prompt (e.g., "Design a globally distributed rate limiter").
2. **Requirements Gathering (Text/Voice):** 
   - **User:** Asks clarifying questions (e.g., "What is the expected QPS? Are we blocking strictly or allowing bursting?").
   - **AI:** Plays the role of the interviewer, providing constraints only when prompted, assessing the user's ability to uncover edge cases.
3. **High-Level Design (Whiteboard):**
   - **User:** Sketches the architecture on the center whiteboard (Apple Pencil/Pen tool).
   - **AI (Background):** Continuously parses the drawing into a semantic component graph.
4. **Deep Dive & Tradeoffs (Dialogue):**
   - **AI:** Identifies a bottleneck (e.g., "Your Redis cluster might become a hot shard. How do you handle a single massive tenant?").
   - **User:** Explains mitigation strategies or updates the drawing.
5. **Evaluation:** AI concludes the interview, summarizes performance, and provides an ideal architectural solution.

### B. Coding / DSA Flow (LeetCode-style)
**Objective:** Solve an algorithmic problem through structured pattern recognition and optimal code implementation.

1. **Problem Presentation:** AI presents a problem statement without explicit constraints.
2. **Understanding Phase:**
   - **User:** Communicates assumptions and asks for constraints.
   - **AI:** Evaluates if the user asked the right questions (e.g., "Are there negative numbers? Does the array fit in memory?").
3. **Brute Force & Pattern Identification:**
   - **User:** Types or writes out the brute-force approach and identifies the underlying pattern (e.g., "This requires a Monotonic Stack to find the next greater element").
   - **AI:** Validates the approach. If incorrect, asks Socratic questions to guide the user back on track.
4. **Optimization & Code Writing:**
   - **User:** Writes Python code in the center editor.
   - **AI:** Observes keystrokes. Does not immediately flag errors, but simulates an interviewer interjecting if the user goes down a rabbit hole.
5. **Edge Cases & Dry Run:**
   - **User:** Manually dry-runs the code with an edge case.
   - **AI:** Highlights skipped edge cases (e.g., "What happens if `k = 0`?") and executes the code against hidden test suites.
6. **Feedback Phase:** Multi-solution comparison and critique of time/space complexity.

---

## 3. Feature Breakdown

### A. System Design Mode
- **Requirement Gathering Phase:** NLP engine to assess if user covered Functional, Non-Functional, and Out-of-Scope requirements.
- **High-Level Design (Diagram Support):** Minimalist whiteboard supporting basic primitives (boxes, cylinders, arrows, text). 
- **Deep Dives (Scaling & Tradeoffs):** AI dynamically injects faults (e.g., "A datacenter just went down") to test system resilience design.
- **AI Critique Engine:** Evaluates single points of failure, data consistency choices, and API design.
- **Diagram Understanding (Important):** Vision-language model integration (e.g., GPT-4o / Gemini 1.5 Pro) to convert whiteboard strokes into a recognizable architecture (API Gateway -> Load Balancer -> Service -> DB).

### B. Coding Mode (CRITICAL)
- **Pattern-Based Learning:** Curated syllabus built on patterns (Sliding Window, Topological Sort, DP on Trees) rather than random sets.
- **Guided Questioning Flow:** Enforces the "Understand -> Brute Force -> Optimize -> Code -> Test" pipeline.
- **Code Writing (Python):** Robust code editor with basic syntax highlighting (no aggressive auto-complete to simulate real interview settings).
- **Execution Engine:** Secure sandbox (Docker/gVisor) executing Python code against robust, unseen test cases.
- **Feedback System:** 
  - **Pattern Detection:** Evaluates if the user utilized the optimal algorithm.
  - **Mistake Detection:** Identifies typical anti-patterns (off-by-one errors, mutable default arguments, incorrect DP state transitions, deadlocks).
  - **Multi-Solution Comparison:** Shows the user's solution side-by-side with the optimal solution, comparing cyclomatic complexity and readability.

---

## 4. AI System Design (VERY IMPORTANT)

### Prompting Strategy & Persona
- **Persona:** Senior Principal Engineer. Helpful but strict. Does not give away answers; uses the Socratic method to gently nudge the user.
- **System Prompts:** Context-aware prompts injected with the current phase (e.g., "You are currently in the Deep Dive phase. The user has drawn a microservice architecture. Ask them how they handle distributed transactions.").

### Socratic Questioning Engine
Instead of saying "Your DP state is wrong," the AI generates: "If you only store the previous row, how do you plan to access the state from `i-2` required by your recurrence relation?"

### Evaluation Rubric
1. **Correctness (30%):** Does the system scale? Does the code pass test cases?
2. **Depth (30%):** Did the user explore alternative approaches? (e.g., "Why Cassandra over PostgreSQL here?")
3. **Complexity (20%):** Optimal Big-O time and space complexity.
4. **Communication (20%):** Did the user gather requirements effectively? Were edge cases proactively brought up?

### Distinct Strategies
- **System Design Strategy:** Heavily stateful. The AI maintains a JSON graph of the evolving architecture and a checklist of required constraints to cover.
- **Coding Strategy:** AST (Abstract Syntax Tree) parsing combined with LLM analysis to detect structural flaws in logic *before* execution.

---

## 5. UX / UI Design

### Layout Structure
- **Left Panel:** The "Interviewer". Contains the problem prompt, active constraints discovered, and the chat interface for back-and-forth dialogue.
- **Center Panel:** The "Workspace". 
  - *Coding Mode:* A clean Monaco-based code editor.
  - *System Design Mode:* A boundless whiteboard (Excalidraw/TLDraw style) with Apple Pencil support.
- **Right Panel (Collapsible):** The "Feedback & Notes" section. Appears post-interview for scoring, rubrics, and the ideal solution.

### Aesthetics
- **Minimal & Focused:** Inspired by CoderPad or simple physical whiteboards. Dark mode by default, utilizing a premium, distraction-free aesthetic (slate greys, subtle typography).
- **Avoid Clutter:** No leaderboards, ads, or gamified badges on the core interview screen. The focus is purely on the technical interaction.

---

## 6. Advanced Features (Principal-Level Depth)

- **Diagram Understanding:** Real-time semantic extraction of drawn diagrams. If a user draws a box named "Cache" pointing to a "DB", the AI understands the read-through/write-through implications.
- **Adaptive Difficulty:** If a user solves the initial problem trivially, the AI dynamically adds constraints (e.g., "Now optimize this algorithm to run in O(1) space," or "Assume the cache hit rate drops to 10%").
- **Follow-Up Question Generation:** Contextual follow-ups based on the user's specific sub-optimal choices.
- **Personalized Learning Paths:** AI identifies weak spots (e.g., "You consistently struggle with Graph Bipartition") and adjusts future problem distributions.
- **Pattern Reinforcement Engine:** Spaced repetition system for algorithmic patterns and architectural components.

---

## 7. Non-Functional Requirements

- **Performance:** 
  - Chat streaming latency < 500ms to maintain conversation flow.
  - Whiteboard stroke synchronization in real-time.
- **Scalability:** Serverless architecture capable of handling concurrent long-running AI streaming sessions.
- **Reliability:** Graceful degradation. If the Vision API fails, fallback to text-based architectural descriptions.
- **Security:** Strict code execution sandboxing using isolated microVMs (e.g., Firecracker) to prevent malicious code from accessing the host environment. No network access within the sandbox.

---

## 8. Metrics

- **Learning Effectiveness:** Improvement in code execution pass rates and system design rubric scores over time per user.
- **User Engagement:** 
  - Average interview sessions completed per week.
  - Time spent in the active coding/drawing states vs. reading prompts.
- **Feedback Accuracy:** Thumbs up / thumbs down ratings on the AI's critique and Socratic hints.

---

## 9. MVP Scope

### Must-Have
- Text-based chat interface acting as the interviewer.
- Code editor with secure Python execution and test case validation.
- Basic whiteboard (mouse/pen support without real-time AI vision parsing; user must explain the drawing in text).
- Guided coding flow (Understand -> Brute Force -> Optimize -> Code).
- Post-interview markdown report with scores and the ideal solution.

### Nice-to-Have
- Real-time diagram understanding via Vision API.
- Voice-to-text integration for spoken requirements gathering.
- Support for additional languages (Java, C++, Go).

### Future Roadmap
- Peer-to-peer mock interviews with AI mediating and grading.
- Integration with real company rubrics (e.g., "Evaluate me strictly against Amazon's Leadership Principles").
- IDE plugins for local preparation.

---

## 10. Risks & Tradeoffs

- **AI Hallucination Risk:** The AI might confidently provide incorrect time complexities or falsely fail a valid architectural design. *Mitigation: Ground the LLM with strict few-shot examples and verify code correctness via the actual execution engine rather than LLM guesswork.*
- **Diagram Interpretation Difficulty:** Hand-drawn diagrams can be messy and misinterpreted by vision models. *Mitigation: Allow the user to clarify their drawing ("The box on the left is the API Gateway"). Use standardized stencils if free-drawing is too unreliable.*
- **Over-Complex UX Risk:** Trying to fit chat, code, and feedback on one screen might overwhelm the user. *Mitigation: Strictly control panel visibility. Feedback is hidden until the session ends. Chat is clean and minimal.*

---

## 11. Differentiation

- **vs. LeetCode:** LeetCode is purely execution-focused. You submit code and get a pass/fail. This platform is *process-focused*. You are graded on how you arrived at the solution, your communication, and your handling of edge cases before execution.
- **vs. Standard System Design Prep (e.g., Educative, ByteByteGo):** Standard platforms are static reading materials. This platform is a dynamic, adversarial simulator where the architecture fights back through AI-injected faults and Socratic probing.
