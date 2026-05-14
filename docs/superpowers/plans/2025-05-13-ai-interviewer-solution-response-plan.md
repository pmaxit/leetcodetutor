# AI Interviewer Solution Response & Copy Button — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the AI interviewer reliably provide full solutions when users ask in natural language, and add a one-click copy button to all code blocks in chat.

**Architecture:** Two backend changes (broaden detection regex + rewrite prompt to positive instructions) and two frontend changes (wrap SyntaxHighlighter in a copyable container + add hover-reveal CSS). No new dependencies.

**Tech Stack:** Node.js/Express backend, React/Vite frontend, `react-syntax-highlighter` for code blocks.

---

### File Structure

| File | Responsibility |
|------|----------------|
| `server/src/agents/InterviewerAgent.js` | Regex detection + solution policy injection |
| `server/src/prompts/agent-dsa.md` | System prompt — natural guidance instead of rigid tree |
| `client/src/App.jsx` | ReactMarkdown `code` component renderer + copy button |
| `client/src/index.css` | Copy button hover-reveal styles |

---

### Task 1: Broaden Solution Request Regex

**Files:**
- Modify: `server/src/agents/InterviewerAgent.js:98`

- [ ] **Step 1: Locate the current regex**

Open `server/src/agents/InterviewerAgent.js` and find line 98. You should see:
```javascript
const askingSolution = /show.*solution|give.*solution|write.*solution|full.*solution|complete.*solution|just.*solution|solution please|the answer|i give up|@showsolution/i.test(userInput);
```

- [ ] **Step 2: Replace with the broader regex**

Replace that single line with:
```javascript
const askingSolution = /\b(?:show|give|write|send|share|tell|walk).{0,15}(?:solution|answer|code|implementation)\b|\b(?:full|complete|entire|whole|final).{0,10}(?:solution|answer|code)\b|\b(?:what is|how (?:do|would|should|can) (?:you|i)).{0,20}(?:solution|answer|code|implement)\b|\bi give up\b|@showsolution/i.test(userInput);
```

- [ ] **Step 3: Verify the change**

The line should now read exactly as above. No other changes on that line.

- [ ] **Step 4: Commit**

```bash
git add server/src/agents/InterviewerAgent.js
git commit -m "feat: broaden solution request regex for natural language"
```

---

### Task 2: Rewrite System Prompt (agent-dsa.md)

**Files:**
- Modify: `server/src/prompts/agent-dsa.md:15-39`

- [ ] **Step 1: Open the file and locate the decision tree**

Lines 15-39 contain a rigid `DECISION TREE` block starting with:
```markdown
----------------------------------
🎯 DECISION TREE (follow strictly)
----------------------------------
```

- [ ] **Step 2: Replace the entire decision tree block**

Delete lines 15-39 (the entire decision tree) and replace with:
```markdown
----------------------------------
🎯 HOW TO RESPOND
----------------------------------

When the user asks for the solution — in any phrasing — provide the FULL implementation generously. Wrap it in a brief, encouraging message like "Here is one clean way to approach this..." or "Sure, here is a solid implementation...". Then give the complete code.

When the user has NOT asked for the solution, guide them with ONE Socratic question or a targeted hint. Never give working code unless they explicitly ask for it.
```

- [ ] **Step 3: Verify no other references to "DECISION TREE" remain**

Search the file for `DECISION TREE` — there should be zero matches after the change.

- [ ] **Step 4: Commit**

```bash
git add server/src/prompts/agent-dsa.md
git commit -m "feat: rewrite agent prompt for natural solution delivery"
```

---

### Task 3: Simplify Solution Policy Injection

**Files:**
- Modify: `server/src/agents/InterviewerAgent.js:248-254`

- [ ] **Step 1: Locate the solutionPolicy block**

Find lines 248-254. You should see:
```javascript
const solutionPolicy = askingSolution
  ? (hintsExhausted
    ? 'User asked for the solution and all hints are exhausted. Provide the FULL solution code with a brief explanation.'
    : `User asked for the solution but ${hints.length - currentHintIndex} hint(s) remain. Say: "You still have hints remaining. Want the next nudge, or the full solution?"`)
  : (hintsExhausted
    ? 'All hints exhausted. If their code looks correct, tell them to run the tests. If not, point out the specific bug.'
    : 'Hints remain. Use the current hint to craft a Socratic nudge. NEVER quote the hint verbatim.');
```

- [ ] **Step 2: Replace with the simplified policy**

Replace that block with:
```javascript
const solutionPolicy = askingSolution
  ? 'The user has asked for the solution. Provide the complete implementation wrapped in a brief, friendly message (e.g., "Here is one clean way to approach this...").'
  : (hintsExhausted
    ? 'All hints exhausted. If their code looks correct, tell them to run the tests. If not, point out the specific bug.'
    : 'Hints remain. Use the current hint to craft a Socratic nudge. NEVER quote the hint verbatim.');
```

- [ ] **Step 3: Verify the change**

The block should now be exactly 4 lines (or formatted as above). The key difference is the removal of the `hintsExhausted` check inside the `askingSolution` branch.

- [ ] **Step 4: Commit**

```bash
git add server/src/agents/InterviewerAgent.js
git commit -m "feat: remove hint gating from solution policy"
```

---

### Task 4: Add Copy Button to Code Blocks (App.jsx)

**Files:**
- Modify: `client/src/App.jsx:~1652` (inside the `ReactMarkdown` `components` prop)

- [ ] **Step 1: Locate the `code` renderer inside ReactMarkdown**

Find the `code` function inside the `components` object passed to `ReactMarkdown`. It should look like:
```jsx
code({ node, inline, className, children, ...props }) {
  const match = /language-(\w+)/.exec(className || '');
  return !inline && match ? (
    <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  );
}
```

- [ ] **Step 2: Ensure `useState` is imported from React**

At the top of the file (line 1), confirm the import is:
```javascript
import React, { useState, useEffect, useRef } from 'react';
```
If `useState` is missing, add it.

- [ ] **Step 3: Replace the `code` renderer**

Replace the entire `code` function with:
```jsx
code({ node, inline, className, children, ...props }) {
  const match = /language-(\w+)/.exec(className || '');
  const codeString = String(children).replace(/\n$/, '');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return !inline && match ? (
    <div className="code-block-wrapper">
      <button className="copy-code-btn" onClick={handleCopy}>
        {copied ? '✓ Copied' : '📋 Copy'}
      </button>
      <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
        {codeString}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  );
}
```

- [ ] **Step 4: Verify the change**

Confirm:
- `useState` is available in scope.
- The `code` function now returns a `<div className="code-block-wrapper">` wrapper.
- The copy button uses `navigator.clipboard.writeText`.

- [ ] **Step 5: Commit**

```bash
git add client/src/App.jsx
git commit -m "feat: add copy button to chat code blocks"
```

---

### Task 5: Add Copy Button CSS

**Files:**
- Modify: `client/src/index.css` (append at end)

- [ ] **Step 1: Open index.css and go to the end of the file**

- [ ] **Step 2: Append the copy button styles**

Add the following block at the very end:
```css
.code-block-wrapper { position: relative; }
.copy-code-btn {
  position: absolute; top: 6px; right: 6px;
  background: rgba(255,255,255,0.1); color: #c9d1d9;
  border: 1px solid rgba(255,255,255,0.15); border-radius: 4px;
  padding: 2px 8px; font-size: 11px; cursor: pointer;
  opacity: 0; transition: opacity 0.2s;
}
.code-block-wrapper:hover .copy-code-btn { opacity: 1; }
.copy-code-btn:hover { background: rgba(255,255,255,0.2); }
```

- [ ] **Step 3: Verify no syntax errors**

Confirm the CSS is valid (no unclosed braces, no malformed selectors).

- [ ] **Step 4: Commit**

```bash
git add client/src/index.css
git commit -m "feat: add hover-reveal copy button styles for code blocks"
```

---

### Task 6: Integration Test (Manual)

**Files:** None (runtime verification)

- [ ] **Step 1: Start the backend**

```bash
cd /home/puneet/Projects/interviews/machine-learning
npm run dev
# or node server/index.js
```

- [ ] **Step 2: Start the frontend**

```bash
cd /home/puneet/Projects/interviews/machine-learning/client
npm run dev
```

- [ ] **Step 3: Test scenario — Natural solution request**

1. Open the app in a browser.
2. Select any DSA problem.
3. In the chat, type: `can you give me the full solution ?`
4. **Expected:** The AI responds with a friendly message like *"Here is one clean way to approach this..."* followed by the complete code.
5. **Failure:** If it responds with a Socratic hint or "You still have hints remaining", the regex or prompt change did not take effect.

- [ ] **Step 4: Test scenario — Hint flow still works**

1. In the same session, type: `i'm stuck`
2. **Expected:** The AI gives a Socratic hint, NOT the full solution.
3. **Failure:** If it gives the solution, the regex is too broad.

- [ ] **Step 5: Test scenario — Copy button**

1. Wait for any AI response that contains a code block.
2. Hover over the code block.
3. **Expected:** A small "📋 Copy" button appears in the top-right corner.
4. Click the button.
5. **Expected:** Button changes to "✓ Copied" for 2 seconds, then reverts. The code is now in your system clipboard.
6. Paste into the Monaco editor.
7. **Expected:** The pasted code matches the block exactly.

- [ ] **Step 6: Commit (if all tests pass)**

If all manual tests pass, there is no additional code change to commit. If tests fail, debug and commit fixes.

---

## Self-Review Checklist

| Spec Requirement | Task |
|------------------|------|
| Broaden regex detection | Task 1 |
| Rewrite prompt to natural guidance | Task 2 |
| Simplify solutionPolicy (remove hint gating) | Task 3 |
| Add copy button to code blocks | Task 4 |
| Add copy button CSS | Task 5 |
| Manual integration test | Task 6 |

- [x] Spec coverage: Every requirement has a task.
- [x] Placeholder scan: No TBD, TODO, or vague instructions.
- [x] Type consistency: `useState` is imported; `codeString` is a string; `navigator.clipboard` is a browser API.

---

**Plan complete and saved to** `docs/superpowers/plans/2025-05-13-ai-interviewer-solution-response-plan.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
