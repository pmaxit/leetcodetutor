---
name: extract-memory
description: Extracts key learnings, technical decisions, and troubleshooting steps from the current session into MEMORY.md. Use at the end of a task or significant milestone.
---

# Memory Extraction Skill

## When to use this skill
- At the end of a significant task or feature implementation.
- After resolving a complex bug or architectural challenge.
- When new patterns or configurations are introduced to the codebase.
- Before finishing a session to ensure future agents (or you in the next session) have context.

## Rules for Memory Extraction
- **Be Concise**: Use bullet points and headers.
- **Focus on "Why"**: Don't just list changes; explain the rationale.
- **Troubleshooting**: Document errors encountered and how they were fixed.
- **Technical Specs**: Include specific IDs, ARNs, or config names if relevant (avoid secrets).
- **Update, Don't Duplicate**: If `MEMORY.md` exists, append or refine it rather than rewriting the whole file.

## Memory Format
### [Date] - [Task Summary]
#### 🧠 Key Learnings
- ...
#### 🛠️ Technical Decisions
- ...
#### 🐞 Troubleshooting & Gotchas
- ...
#### 🚀 Deployment & Infrastructure
- ...
