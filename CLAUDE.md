# Claude Code Project Instructions

## graphify

This is an AI Interview Platform codebase. Use graphify to understand the architecture before making changes:

```bash
/graphify                     # Build knowledge graph of current code
/graphify query "<question>"  # Ask the graph about concepts
/graphify path "X" "Y"        # Find connections between ideas
/graphify explain "Concept"   # Deep dive on a component
```

The graph persists in `graphify-out/` across sessions. Run `/graphify --update` after major changes to keep it current.

**God nodes to watch:** InterviewerAgent, LLMService, dp_solutions — these are likely architectural hubs.

## Project Context

- **Type:** Full-stack ML interview platform (Node.js + React)
- **Key services:** Interviewer agent, LLM integration, solution storage
- **Status:** Initial structure committed, actively under development
