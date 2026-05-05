# Implementation Plan: MVP Completion (Evaluation & Reporting)

## Goal
Complete the "Evaluation" phase of the MVP as defined in the PRD. This includes implementing the `Scorer` agent to generate high-fidelity reports based on the rubric (Correctness, Depth, Complexity, Communication).

## Proposed Changes

### 1. Evaluation Engine (`ScorerAgent.js`)
- Implement logic to aggregate session data (requirements gathered, code complexity, architectural choices).
- Generate a multi-dimensional score (0-100) and a qualitative critique.
- Follow the rubric defined in the PRD (Correctness 30%, Depth 30%, Complexity 20%, Communication 20%).

### 2. State Integration
- Update `StateManager.js` to handle the final state transition to `EVALUATION`.
- Store the generated report in the session state.

### 3. UI Enhancements
- Implement a "Finish Interview" button that triggers the evaluation.
- Create a `ReportModal` or `FeedbackPanel` to display the Scorer's output.
- Add "Micro-Critiques" during phase transitions (as mentioned in AGENTS.md).

### 4. Code Execution (Mock)
- Add a "Run Code" feature to the editor. For now, it will simulate execution and return output/errors to the Proctor.

## Files to touch
- `server/src/agents/ScorerAgent.js` (New)
- `server/src/state/StateManager.js` (Modify)
- `server/index.js` (Modify)
- `client/src/App.jsx` (Modify)

## Verification Plan
1. **Report Accuracy**: Verify that a session with many requirements gathered gets a higher "Communication" score than one with few.
2. **Phase Transition**: Verify the interview correctly ends and switches to the report view.
3. **Consistency**: Ensure the report references specific evidence from the conversation history.
