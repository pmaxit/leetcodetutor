# Draft: AI Interviewer Chat History Fix

## Problem Diagnosis (confirmed)
- `StateManager.addMessage()` hard-caps `conversationHistory` at 20 messages — oldest are silently dropped
- Sessions live in `const sessions = new Map()` in-memory — all history lost on server restart or page refresh
- The agent DOES receive `pastMessages` from `state.state?.conversationHistory` but it's truncated to 20
- System prompt is rebuilt every turn (~3000+ chars) and competes with history for context window
- No database persistence for chat history exists

## Root Cause
The 20-message cap in `StateManager.js:28` is the primary culprit. In a back-and-forth interview, you hit 20 messages quickly.

## Decisions Made
- **Remove the 20-message cap** and replace with intelligent sliding-window logic
- **Persist chat history to database** using `QuestionStatus` model (already tracks per-user-per-question state)
- **Load history from DB on session init** so it survives restarts and page refreshes
- **Smart context window management**: keep system prompt + last N messages (configurable), truncate oldest if needed

## Scope
- IN: StateManager.js, InterviewerAgent.js, server/index.js, QuestionStatus model
- OUT: Changes to LLMService.js legacy methods, client-side message rendering

## Technical Approach
1. Remove hard 20-message cap in StateManager
2. Add `conversation_history` JSON column to `QuestionStatus` model
3. Save history to DB after each chat turn in `/api/chat`
4. Load history from DB when creating/getting session in `getSession`
5. Add `buildMessagesWithHistory()` helper in InterviewerAgent for intelligent context window management
