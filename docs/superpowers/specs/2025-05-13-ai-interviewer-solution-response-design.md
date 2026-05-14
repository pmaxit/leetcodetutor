# AI Interviewer Solution Response & Copy Button — Design Spec

**Date:** 2025-05-13  
**Status:** Approved  
**Approach:** Hybrid (C) — Smart Detection + Natural Response + Copy Button

---

## 1. Problem Statement

The AI interviewer agent does not reliably honor natural-language requests for the full solution. When a user asks something like *"can you give me the full solution ?"*, the agent either:
1. **Ignores the request** and delivers a Socratic hint instead, or
2. **Gates the solution behind hint exhaustion**, responding with a rigid *"You still have hints remaining"* message.

Additionally, when the agent **does** provide code, there is no easy way for the user to copy it into their editor.

---

## 2. Goals

1. **Honor solution requests immediately** when detected, regardless of hint state.
2. **Detect requests in natural language** — not just exact keyword matches.
3. **Deliver solutions with a friendly, conversational wrapper** rather than a rigid policy statement.
4. **Add a one-click copy button** to every code block in chat messages.

---

## 3. Non-Goals

- Do NOT change the Socratic flow when the user has **not** asked for the solution.
- Do NOT add a "show solution" UI button in the frontend (out of scope).
- Do NOT persist or track whether a user "gave up" (no analytics changes).

---

## 4. Architecture Overview

The change spans **two layers**:

| Layer | Files | Responsibility |
|-------|-------|----------------|
| Backend — Detection | `server/src/agents/InterviewerAgent.js` | Broaden regex, remove hint-gating logic |
| Backend — Prompt | `server/src/prompts/agent-dsa.md` | Rewrite decision tree into natural guidance |
| Frontend — UI | `client/src/App.jsx`, `client/src/index.css` | Add copy button to `SyntaxHighlighter` blocks |

---

## 5. Detailed Design

### 5.1 Solution Request Detection

**File:** `server/src/agents/InterviewerAgent.js` (~line 98)

**Current regex:**
```javascript
/show.*solution|give.*solution|write.*solution|full.*solution|complete.*solution|just.*solution|solution please|the answer|i give up|@showsolution/i
```

**New regex:**
```javascript
/\b(?:show|give|write|send|share|tell|walk).{0,15}(?:solution|answer|code|implementation)\b|\b(?:full|complete|entire|whole|final).{0,10}(?:solution|answer|code)\b|\b(?:what is|how (?:do|would|should|can) (?:you|i)).{0,20}(?:solution|answer|code|implement)\b|\bi give up\b|@showsolution/i
```

**Rationale:**
- Uses word boundaries (`\b`) to reduce false positives.
- Covers action verbs (`walk`, `share`, `tell`) and adjectives (`entire`, `whole`).
- Catches interrogative forms (`how would you solve`, `what is the code`).
- Keeps `@showsolution` as an explicit escape hatch.

### 5.2 Natural Prompt Redesign

**File:** `server/src/prompts/agent-dsa.md`

**Current behavior (lines 15-39):** A rigid decision tree that gates solutions behind hint exhaustion.

**New behavior:** Positive instructions.

Replace the decision tree with:
```markdown
----------------------------------
🎯 HOW TO RESPOND
----------------------------------

When the user asks for the solution — in any phrasing — provide the FULL implementation generously. Wrap it in a brief, encouraging message like "Here is one clean way to approach this..." or "Sure, here is a solid implementation...". Then give the complete code.

When the user has NOT asked for the solution, guide them with ONE Socratic question or a targeted hint. Never give working code unless they explicitly ask for it.
```

**File:** `server/src/agents/InterviewerAgent.js` (~lines 248-254)

**Current `solutionPolicy`:**
```javascript
const solutionPolicy = askingSolution
  ? (hintsExhausted
    ? 'User asked for the solution and all hints are exhausted. Provide the FULL solution code with a brief explanation.'
    : `User asked for the solution but ${hints.length - currentHintIndex} hint(s) remain. Say: "You still have hints remaining. Want the next nudge, or the full solution?"`)
  : (hintsExhausted
    ? 'All hints exhausted. If their code looks correct, tell them to run the tests. If not, point out the specific bug.'
    : 'Hints remain. Use the current hint to craft a Socratic nudge. NEVER quote the hint verbatim.');
```

**New `solutionPolicy`:**
```javascript
const solutionPolicy = askingSolution
  ? 'The user has asked for the solution. Provide the complete implementation wrapped in a brief, friendly message (e.g., "Here is one clean way to approach this...").'
  : (hintsExhausted
    ? 'All hints exhausted. If their code looks correct, tell them to run the tests. If not, point out the specific bug.'
    : 'Hints remain. Use the current hint to craft a Socratic nudge. NEVER quote the hint verbatim.');
```

**Rationale:**
- Positive instructions (`DO this when X`) are followed more reliably by LLMs than negative rules (`DON'T do this unless Y`).
- Removing the hint-gating branch eliminates the failure mode where the LLM delivers a hint instead of the solution.

### 5.3 Copy Button for Code Blocks

**File:** `client/src/App.jsx` (~line 1652, inside `ReactMarkdown` `components`)

**Current `code` renderer:**
```jsx
code({ node, inline, className, children, ...props }) {
  const match = /language-(\w+)/.exec(className || '');
  return !inline && match ? (
    <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : (
    <code className={className} {...props}>{children}</code>
  );
}
```

**New `code` renderer:**
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
    <code className={className} {...props}>{children}</code>
  );
}
```

**File:** `client/src/index.css` (append)

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

**Rationale:**
- `navigator.clipboard` is supported in all modern browsers.
- Hover-only visibility keeps the UI clean and uncluttered.
- The `useState` for `copied` is local to each code block instance.

---

## 6. Testing Plan

| Scenario | Expected Result |
|----------|-----------------|
| User types "can you give me the full solution" | Agent provides full code with friendly wrapper |
| User types "how would you solve this" | Agent provides full code with friendly wrapper |
| User types "i give up" | Agent provides full code with friendly wrapper |
| User types "i'm stuck" (no solution request) | Agent gives Socratic hint |
| User hovers over a code block | Copy button appears |
| User clicks Copy button | Code copied to clipboard, button shows "✓ Copied" for 2s |

---

## 7. Rollback Plan

If the broader regex causes false positives (e.g., "how do you write a solution design doc" triggers a code dump), revert the regex to the previous version while keeping the prompt and copy button changes.

---

## 8. Future Considerations

- **Intent classification via LLM:** For even better accuracy, a lightweight LLM call could classify intent before the main response generation. This is deferred due to latency/cost.
- **Copy button for non-code blocks:** Could be extended to copy entire AI messages, but out of scope for now.
