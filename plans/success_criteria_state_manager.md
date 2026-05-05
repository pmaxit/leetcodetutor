# Implementation Plan: Success Criteria State Manager

## Goal
Implement a centralized state management system (Option C from brainstorm) that orchestrates the Socratic interview loop, enforces phase transitions, and coordinates multiple AI agents (Interviewer, Architect, Proctor, Scorer).

## Proposed Changes

### 1. Foundation & Constants
- Define interview phases for both System Design and DSA.
- Specify "Success Criteria" for each phase transition.

### 2. State Engine (`StateManager.js`)
- Maintain session state: `currentPhase`, `requirementsGained`, `architecturalGraph`, `codeBuffer`, `conversationHistory`.
- Implement `transitionTo(nextPhase)` with validation.
- Implement `processMessage(userInput)` which routes to the appropriate agent.

### 3. Agent Architecture
- Create a `BaseAgent` class for common LLM interaction logic.
- Implement `InterviewerAgent`: Handles Socratic nudging and phase gating.
- Implement `ProctorAgent` (Mock): Silent observation of code.
- Implement `ArchitectAgent` (Mock): Semantic graph updates.

### 4. API Layer
- Express server with POST `/api/chat` and GET `/api/session`.

## Files to touch
- `package.json` (New)
- `server/index.js` (New)
- `server/src/constants/Phases.js` (New)
- `server/src/state/StateManager.js` (New)
- `server/src/agents/BaseAgent.js` (New)
- `server/src/agents/InterviewerAgent.js` (New)

## Verification Plan

### Automated Tests
1. **Phase Transition Test**: Verify that the State Manager blocks transition from `Requirements` to `HighLevelDesign` if criteria aren't met.
2. **Socratic Guardrail Test**: Verify that the Interviewer agent response contains a question (simple check for now).
3. **State Consistency Test**: Verify that `architecturalGraph` updates correctly when simulated vision data is sent.

### Manual Verification
1. Start the server.
2. Send a message "Design a rate limiter".
3. Verify the state initializes to the `Requirements` phase.
4. Try to send "Here is my code" and verify the Interviewer nudges back to requirements.
