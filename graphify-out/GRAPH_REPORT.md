# Graph Report - machine-learning  (2026-05-06)

## Corpus Check
- 83 files · ~328,203 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 247 nodes · 224 edges · 25 communities detected
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]

## God Nodes (most connected - your core abstractions)
1. `LLMService` - 13 edges
2. `LogStreamer` - 10 edges
3. `ScorerAgent` - 8 edges
4. `StateManager` - 7 edges
5. `main()` - 7 edges
6. `processProblem()` - 6 edges
7. `main()` - 6 edges
8. `main()` - 5 edges
9. `InterviewerAgent` - 4 edges
10. `BaseAgent` - 4 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "Community 0"
Cohesion: 0.2
Nodes (4): listModels(), testGemini(), enrich(), LLMService

### Community 1 - "Community 1"
Cohesion: 0.15
Nodes (3): InterviewerAgent, ProctorAgent, SearchService

### Community 2 - "Community 2"
Cohesion: 0.24
Nodes (1): LogStreamer

### Community 3 - "Community 3"
Cohesion: 0.31
Nodes (9): enrichWithLLM(), extractFunctionParams(), fetchAllProblemSlugs(), fetchProblemViaGraphQL(), main(), parseExamples(), processProblem(), saveImagesToLocal() (+1 more)

### Community 4 - "Community 4"
Cohesion: 0.36
Nodes (1): ScorerAgent

### Community 5 - "Community 5"
Cohesion: 0.42
Nodes (8): connectToCloudSQL(), downloadAndReplaceImages(), fetchFromLeetCode(), main(), respectfulDelay(), sleep(), titleToSlug(), updateProblemInDB()

### Community 6 - "Community 6"
Cohesion: 0.29
Nodes (1): StateManager

### Community 7 - "Community 7"
Cohesion: 0.52
Nodes (6): downloadAndReplaceImages(), fetchFromLeetCode(), main(), sleep(), titleToSlug(), updateViaSQL()

### Community 9 - "Community 9"
Cohesion: 0.6
Nodes (5): fetchFromLeetCode(), main(), sleep(), titleToSlug(), updateViaSQL()

### Community 11 - "Community 11"
Cohesion: 0.4
Nodes (1): BaseAgent

### Community 12 - "Community 12"
Cohesion: 0.7
Nodes (4): fetchProblem(), main(), saveToDatabase(), sleep()

### Community 14 - "Community 14"
Cohesion: 0.83
Nodes (3): generateScaffold(), processQuestion(), run()

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (2): extractBoilerplate(), run()

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (2): parseMarkdownToStages(), seed()

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (2): generateScaffold(), run()

### Community 78 - "Community 78"
Cohesion: 1.0
Nodes (1): AI Interview Platform Architecture

### Community 79 - "Community 79"
Cohesion: 1.0
Nodes (1): Connection Error Fix

### Community 80 - "Community 80"
Cohesion: 1.0
Nodes (1): Database Analysis

### Community 81 - "Community 81"
Cohesion: 1.0
Nodes (1): Data Source Confirmation

### Community 82 - "Community 82"
Cohesion: 1.0
Nodes (1): Debug Guide

### Community 83 - "Community 83"
Cohesion: 1.0
Nodes (1): Deployment Documentation

### Community 84 - "Community 84"
Cohesion: 1.0
Nodes (1): Deployment Guide

### Community 85 - "Community 85"
Cohesion: 1.0
Nodes (1): Deployment Scripts

### Community 86 - "Community 86"
Cohesion: 1.0
Nodes (1): Deploy Cheatsheet

### Community 87 - "Community 87"
Cohesion: 1.0
Nodes (1): Ngrok Deployment Cheatsheet

## Knowledge Gaps
- **10 isolated node(s):** `AI Interview Platform Architecture`, `Connection Error Fix`, `Database Analysis`, `Data Source Confirmation`, `Debug Guide` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 2`** (11 nodes): `LogStreamer.js`, `LogStreamer`, `.addLog()`, `.broadcast()`, `.captureLog()`, `.constructor()`, `.detectLogLevel()`, `.getRecentLogs()`, `.start()`, `.stop()`, `.subscribe()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 4`** (9 nodes): `ScorerAgent`, `.constructor()`, `._generateLLMCritique()`, `.generateReport()`, `._scoreCommunication()`, `._scoreComplexity()`, `._scoreCorrectness()`, `._scoreDepth()`, `ScorerAgent.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 6`** (8 nodes): `StateManager.js`, `StateManager`, `.addMessage()`, `.constructor()`, `.getSummary()`, `.transitionTo()`, `.updateState()`, `._verifyCriteria()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (5 nodes): `BaseAgent`, `.constructor()`, `.generateResponse()`, `._getSystemPrompt()`, `BaseAgent.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (3 nodes): `extractBoilerplate()`, `run()`, `reset_boilerplates.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (3 nodes): `parseMarkdownToStages()`, `seed()`, `seed_system_design.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (3 nodes): `generateScaffold()`, `verify_3sum.js`, `run()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (1 nodes): `AI Interview Platform Architecture`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (1 nodes): `Connection Error Fix`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 80`** (1 nodes): `Database Analysis`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (1 nodes): `Data Source Confirmation`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (1 nodes): `Debug Guide`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 83`** (1 nodes): `Deployment Documentation`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (1 nodes): `Deployment Guide`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 85`** (1 nodes): `Deployment Scripts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 86`** (1 nodes): `Deploy Cheatsheet`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 87`** (1 nodes): `Ngrok Deployment Cheatsheet`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `enrichWithLLM()` connect `Community 3` to `Community 0`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `AI Interview Platform Architecture`, `Connection Error Fix`, `Database Analysis` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._