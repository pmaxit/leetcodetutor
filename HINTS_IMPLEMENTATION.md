# Hints-Based Socratic Learning Implementation

## Problem Statement
The interviewer AI was returning complete solutions instead of using stored hints to guide students through Socratic learning patterns.

## Root Causes Identified

### 1. **Hints Stored But Not Used**
- Database: `Question.hints` field exists as JSON array (line 46 in Question.js)
- Agent: `InterviewerAgent.js` fetched hints (line 12) but never passed them to LLMService
- LLM: `LLMService.generateReActResponse()` had no knowledge of hints

### 2. **No Progressive Hint Tracking**
- No state tracking for which hints have been shown
- `currentHintIndex` existed in state but was never updated
- No differentiation between "help" and "show solution" requests

### 3. **LLM Prompts Didn't Include Hints**
- System prompts had no hint context
- LLM couldn't differentiate between hint-based guidance and solution-giving

## Solution Implemented

### 1. **Enhanced InterviewerAgent** (server/src/agents/InterviewerAgent.js)
```javascript
// Now passes hint context to LLMService
const hintContext = {
  hints,                    // array of hint strings
  currentHintIndex,         // which hint to show next
  askingSolution,           // detected from user input
  hintsExhausted           // currentHintIndex >= hints.length
};

const llmOutput = await LLMService.generateReActResponse(
  userInput,
  state,
  scratchpad,
  hintContext              // NEW: hint context passed
);
```

**Key features:**
- Detects "show solution" requests: `/show.*solution|give.*code|i give up|@showsolution/i`
- Tracks `nextHintIndex` and returns it to session state
- Increments hint index automatically when a hint is provided
- Logs hint availability for debugging

### 2. **Updated LLMService** (server/src/services/LLMService.js)

#### generateReActResponse() Enhancement
```javascript
async generateReActResponse(userInput, state, scratchpad = "", hintContext = {})

// Now includes:
- Current hint in system prompt
- Hints remaining counter
- Conditional solution disclosure rules:
  * Solution ONLY if user asks AND hints exhausted
  * Otherwise: Socratic nudge with current hint
```

#### Pedagogical Rules in Prompt
```
1. HINTS-FIRST approach: Use hints to guide with Socratic nudges
2. Current Hint (index N): "specific hint text"
3. If user asks for solution AND hints exhausted: Provide FULL SOLUTION
4. If user asks for solution BUT hints remain: Suggest current hint first
5. NEVER include working code unless explicitly asked for solution
```

### 3. **Chat Rules Documented** (GEMINI.md)

Added comprehensive hints-based interview section covering:
- Data structure (JSON array format)
- Progressive hint disclosure rules
- Hint usage in LLM prompts (no spoilers)
- Solution disclosure conditions (4 criteria)
- Chat response structure with examples
- Edge cases and fallbacks

## Database Schema (Already Exists)
```javascript
// Question model
hints: { type: DataTypes.JSON, allowNull: true }

// Example data structure:
[
  "Consider the constraint: What are the bounds of n?",
  "Think about state transitions: What does dp[i] represent?",
  "Review base cases: Are they correctly initialized?",
  "Check for off-by-one errors in indexing"
]
```

## Flow Diagram

```
User sends message
    ↓
InterviewerAgent.generateResponse()
    ├─ Extract hints from question
    ├─ Detect if asking for solution
    ├─ Check if hints exhausted
    └─ Pass hintContext to LLMService
    ↓
LLMService.generateReActResponse(userInput, state, scratchpad, hintContext)
    ├─ Get current hint from hintContext
    ├─ Check: asking for solution && hints exhausted?
    │   ├─ YES → Show full solution code
    │   └─ NO → Rephrase current hint as Socratic nudge
    └─ Return response + recommendation to increment hint index
    ↓
InterviewerAgent
    ├─ Parse LLM response
    ├─ If hint was shown: increment nextHintIndex
    └─ Return { text, nextHintIndex }
    ↓
Server (/api/chat)
    ├─ Update session state with nextHintIndex
    └─ Send response to client
```

## State Transitions

```
Initial: currentHintIndex = 0 (no hint shown)

User: "I'm stuck"
→ Show hint[0]
→ currentHintIndex becomes 1

User: "Still stuck"
→ Show hint[1]
→ currentHintIndex becomes 2

User: "Can you show me the solution?"
→ IF currentHintIndex < hints.length:
    Suggest showing current hint first
→ IF currentHintIndex >= hints.length:
    Show full solution code

User: "show solution" (at currentHintIndex=0)
→ NOT exhausted, so decline/suggest hints first
```

## Configuration

No configuration needed - the system works out of the box:
- Hints are auto-loaded from database
- Hint index is tracked in session state
- Solution detection is regex-based (can be extended)

## Testing Hints Flow

1. **Verify hints exist in DB:**
   ```sql
   SELECT title, json_array_length(hints) as hint_count FROM problems;
   ```

2. **Test progressive disclosure:**
   - Message: "I need help" → Should get hint[0]
   - Message: "I need more help" → Should get hint[1]
   - Message: "Show me the code" → Should suggest hints
   - After exhausting hints, request should show solution

3. **Test solution detection:**
   - "show solution" → Should show if hints exhausted
   - "@showsolution" → Should show if hints exhausted
   - "I give up" → Should show if hints exhausted

## Benefits

✅ **Student-Centric**: Forces hint-based learning before solutions  
✅ **Data-Driven**: Tracks which hints were effective  
✅ **Scalable**: Works with any number of hints per problem  
✅ **Socratic**: LLM rephrases hints naturally (no rote responses)  
✅ **Explicit Control**: Users can request solutions anytime (if exhausted)

## Future Enhancements

- [ ] Track hint effectiveness: did student solve after hint N?
- [ ] A/B test hint quality and ordering
- [ ] Generate hints automatically from reference solution
- [ ] Adaptive hints based on code analysis (current approach vs reference)
- [ ] Hint confidence scoring (which hints work best for different learners)
