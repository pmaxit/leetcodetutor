# Strict Hints Pattern for AI Interviewer

## Overview
Each problem has exactly **3 hints maximum** that follow a strict pedagogical pattern. These hints guide students through Socratic learning by progressively revealing critical insights without spoiling solutions.

## Hint Pattern Structure

### Hint 1: Critical Insight / Problem Framing
**Purpose**: Identify the core constraint or how to frame the state/approach

**Examples**:
- Two Pointers: "What are the two boundary conditions you need to check? Start at opposite ends and move inward."
- Sliding Window: "Define your window explicitly: what are the start and end positions? When do you expand vs shrink?"
- DP: "Define your DP state: what does dp[i] or dp[i][j] represent? This is the critical insight."

**Characteristics**:
- Asks a clarifying question about problem setup
- Focuses on defining variables/state
- Helps student frame the problem correctly
- ~15-20 words

### Hint 2: Core Algorithm / Approach
**Purpose**: Guide toward the main algorithm or recurrence relation

**Examples**:
- Two Pointers: "Each pointer moves toward the optimal solution. When does your left pointer advance vs when does your right pointer retreat?"
- Sliding Window: "Maintain invariants inside the window. What condition must be true when you expand, and what breaks it?"
- DP: "Derive the recurrence: how does the current state depend on smaller subproblems? Work backward from the goal."

**Characteristics**:
- Focuses on transitions or dependencies
- Explains the core logic without revealing code
- Often a "why" question
- ~15-20 words

### Hint 3: Edge Cases / Optimization
**Purpose**: Handle boundary conditions and optimizations

**Examples**:
- Two Pointers: "Watch for off-by-one errors in the termination condition and handle edge cases like duplicate values."
- Sliding Window: "Optimize using a hash map or counter to track elements in the current window for O(1) updates."
- DP: "Base cases matter. What are the simplest subproblems? Ensure your recurrence handles boundaries correctly."

**Characteristics**:
- Addresses edge cases, boundary conditions, or optimizations
- Mentions specific pitfalls to avoid
- ~15-20 words

---

## Hints by Problem Pattern

### Two Pointers
1. What are the two boundary conditions you need to check? Start at opposite ends and move inward.
2. Each pointer moves toward the optimal solution. When does your left pointer advance vs when does your right pointer retreat?
3. Watch for off-by-one errors in the termination condition and handle edge cases like duplicate values.

### Sliding Window
1. Define your window explicitly: what are the start and end positions? When do you expand vs shrink the window?
2. Maintain invariants inside the window. What condition must be true when you expand, and what breaks it?
3. Optimize using a hash map or counter to track elements in the current window for O(1) updates.

### Intervals
1. Sort intervals first. Why does sorting by start time matter for overlap detection?
2. Two intervals overlap if one starts before the other ends. How do you merge them efficiently?
3. Track the current merged interval and update it as you iterate. Handle edge cases where intervals touch at boundaries.

### Stack
1. Stack property: Last-In-First-Out. When do you push vs pop? What invariant must the stack maintain?
2. Use the stack to defer decisions. What information do you store on the stack to match/validate later?
3. Peek at the top without popping to make decisions. Handle empty stack edge cases carefully.

### Linked List
1. Pointer manipulation is key. How do you reverse pointers or skip nodes without losing references?
2. Use slow/fast pointers for cycle detection. Why does the tortoise-hare algorithm work?
3. Be careful with null checks and edge cases: empty list, single node, or operations at head/tail.

### Binary Search
1. Define your search space clearly: what is the invariant at each step? When do you narrow left vs right?
2. Exit condition: when does left == right or left > right? Which boundary includes your answer?
3. Off-by-one errors are common. Test with small arrays: 1 element, 2 elements, and verify boundaries.

### Dynamic Programming
1. Define your DP state: what does dp[i] or dp[i][j] represent? This is the critical insight.
2. Derive the recurrence: how does the current state depend on smaller subproblems? Work backward from the goal.
3. Base cases matter. What are the simplest subproblems? Ensure your recurrence handles boundaries correctly.

### Graph / DFS / BFS
1. Build your graph explicitly: adjacency list or matrix? What does each edge represent in the problem?
2. Choose DFS or BFS based on your goal. DFS for depth-first exploration, BFS for shortest paths or level-order.
3. Track visited nodes to avoid cycles. Use topological sort for DAGs or detect cycles in directed graphs.

### String
1. Clarify character types: ASCII, Unicode, case-sensitive? Are spaces or special characters significant?
2. Common patterns: rolling hash for substring matching, KMP for pattern search, or character frequency maps.
3. Edge cases: empty strings, single characters, repeated patterns. Verify your algorithm handles them.

### Array / Matrix
1. In-place operations save space. Can you use the array itself as auxiliary storage?
2. Sorted vs unsorted? Sorting unlocks two-pointer, binary search, or greedy approaches.
3. Prefix/suffix techniques can precompute results. What can you answer in O(1) after O(n) preprocessing?

---

## AI Interviewer Integration

### Initial Probe (First Message)
When a student starts a problem, the AI interviewer returns **Hint 1** with context:
```
### Initial Guidance

[Hint 1 text from database]
```
Session state: `currentHintIndex = 1` (first hint shown)

### Progressive Disclosure
- **Message "I'm stuck"**: Show Hint 2, advance `currentHintIndex` to 2
- **Message "Still stuck"**: Show Hint 3, advance `currentHintIndex` to 3
- **Message "Show solution"** (after Hint 3): Show full solution code
- **Message "Show solution"** (before Hint 3): Suggest showing remaining hints first

### Hint Advancement Rules
```javascript
// Increment hint index when:
- User asks for help and hasn't seen all hints
- LLM response contains hint-based guidance words: "consider", "think about", "nudge"

// Don't increment when:
- User is asking for full solution
- All hints have been exhausted
- LLM is providing code/implementation details
```

---

## Database Schema

```sql
CREATE TABLE Questions (
  id INTEGER PRIMARY KEY,
  title VARCHAR(255),
  pattern VARCHAR(255),
  hints JSON,                -- Array of 3 strings max
  python_code TEXT,          -- Reference solution
  solution_format TEXT,      -- Solution breakdown
  initial_probe TEXT,        -- Generated or pre-computed
  ...
);
```

**Hints Column Format**:
```json
[
  "Hint 1: Critical insight / problem framing",
  "Hint 2: Core algorithm / approach step",
  "Hint 3: Edge cases / optimization"
]
```

---

## Implementation Checklist

- [x] Database migration: Added hints column to Questions table
- [x] Hints generation: 77 problems now have 3 hints each
- [x] Hint pattern validation: Consistent across problem types
- [x] InterviewerAgent: Uses first hint as initial response
- [x] State tracking: currentHintIndex properly incremented
- [x] LLMService: Aware of hint context and progression rules
- [x] GEMINI.md: Chat rules documented
- [ ] Frontend: Display hint indicator ("Hint 2 of 3")
- [ ] Analytics: Track hint effectiveness per problem
- [ ] A/B testing: Validate hint quality and ordering

---

## Example: "Best Time to Buy and Sell Stock"

**Pattern**: Greedy

**Hints**:
1. "Greedy works only if local optimal choices lead to global optimality. Prove this property for your problem."
2. "Sort or prioritize by the right metric first. What quantity should you optimize at each step?"
3. "Test greedy against counterexamples. Does it fail on certain inputs? If so, you may need DP instead."

**Flow**:
```
Student starts interview
→ Initial response: Hint 1 (ask about proving greedy optimality)
→ Student: "I'm confused"
→ AI: Show Hint 2 (focus on metric to optimize - tracking min price so far)
→ Student: "I think I understand, but help me implement"
→ AI: Socratic nudges about state variables, no code yet
→ Student: "Show solution"
→ AI: Either show Hint 3 OR full solution (depending on hint index)
```

---

## Quality Metrics

For each problem, measure:
- **Hint clarity**: Did students understand the hint?
- **Hint effectiveness**: Did students solve after hint N?
- **Hint ordering**: Do hints lead students in the right direction?
- **Solution spoilage**: Did hints accidentally reveal too much?

Target: 70%+ of students should solve after Hint 2, 90%+ after Hint 3.
