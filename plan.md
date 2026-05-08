# UI Testing Plan - Antigravity

## Scenarios

### [ ] Scenario 1: Problem Workflow (End-to-End)
- [ ] Navigate to `DSA Problems`.
- [ ] Select a problem from the list.
- [ ] Verify problem description renders.
- [ ] Type code into the `CODE EDITOR`.
- [ ] Click `GET AI FEEDBACK` and verify AI Insights section updates.
- [ ] Click `RESET CODE` and verify editor is cleared.

### [x] Scenario 2: Interviewer Interaction
- [x] Select a problem.
- [x] Type a question in the "Interviewer" chat (e.g., "What is the time complexity?").
- [x] Click `Send`.
- [x] Verify the message appears in the chat history and an AI response is received.

### [ ] Scenario 3: Mode Switching
- [ ] Switch from `Algorithms` to `System Design` via top navigation.
- [ ] Verify sidebar items change (e.g., focus on System Design curriculum).
- [ ] Switch back to `Algorithms` and verify UI restores.

### [ ] Scenario 4: Session Management
- [ ] Navigate to `Active Sessions`.
- [ ] Identify an existing session.
- [ ] Click the delete button (`🗑`) for a session.
- [ ] Verify the session is removed from the list.

## Summary of Results
| Scenario | Status | Notes |
| :--- | :--- | :--- |
| Scenario 1 | PENDING | |
| Scenario 2 | PASSED | Chat responded with a hint ("Recursion depth") |
| Scenario 3 | PENDING | |
| Scenario 4 | PENDING | |
