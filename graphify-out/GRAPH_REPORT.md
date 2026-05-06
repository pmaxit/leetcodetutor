# Graph Report - .  (2026-05-05)

## Corpus Check
- 127 files · ~311,142 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 117 nodes · 109 edges · 18 communities detected
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_list_models.js & listModels()|list_models.js & listModels()]]
- [[_COMMUNITY_InterviewerAgent & .constructor()|InterviewerAgent & .constructor()]]
- [[_COMMUNITY_LogStreamer.js & LogStreamer|LogStreamer.js & LogStreamer]]
- [[_COMMUNITY_ScorerAgent & .constructor()|ScorerAgent & .constructor()]]
- [[_COMMUNITY_StateManager.js & StateManager|StateManager.js & StateManager]]
- [[_COMMUNITY_BaseAgent & .constructor()|BaseAgent & .constructor()]]
- [[_COMMUNITY_parseMarkdownToStages() & seed()|parseMarkdownToStages() & seed()]]
- [[_COMMUNITY_enrich() & enrich_boilerplates.js|enrich() & enrich_boilerplates.js]]
- [[_COMMUNITY_AI Interview Platform Architecture|AI Interview Platform Architecture]]
- [[_COMMUNITY_Connection Error Fix|Connection Error Fix]]
- [[_COMMUNITY_Database Analysis|Database Analysis]]
- [[_COMMUNITY_Data Source Confirmation|Data Source Confirmation]]
- [[_COMMUNITY_Debug Guide|Debug Guide]]
- [[_COMMUNITY_Deployment Documentation|Deployment Documentation]]
- [[_COMMUNITY_Deployment Guide|Deployment Guide]]
- [[_COMMUNITY_Deployment Scripts|Deployment Scripts]]
- [[_COMMUNITY_Deploy Cheatsheet|Deploy Cheatsheet]]
- [[_COMMUNITY_Ngrok Deployment Cheatsheet|Ngrok Deployment Cheatsheet]]

## God Nodes (most connected - your core abstractions)
1. `LLMService` - 13 edges
2. `LogStreamer` - 11 edges
3. `ScorerAgent` - 8 edges
4. `StateManager` - 7 edges
5. `InterviewerAgent` - 4 edges
6. `BaseAgent` - 4 edges
7. `SearchService` - 3 edges
8. `ProctorAgent` - 3 edges
9. `testGemini()` - 2 edges
10. `listModels()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "list_models.js & listModels()"
Cohesion: 0.24
Nodes (3): listModels(), testGemini(), LLMService

### Community 1 - "InterviewerAgent & .constructor()"
Cohesion: 0.15
Nodes (3): InterviewerAgent, ProctorAgent, SearchService

### Community 2 - "LogStreamer.js & LogStreamer"
Cohesion: 0.18
Nodes (1): LogStreamer

### Community 3 - "ScorerAgent & .constructor()"
Cohesion: 0.36
Nodes (1): ScorerAgent

### Community 4 - "StateManager.js & StateManager"
Cohesion: 0.29
Nodes (1): StateManager

### Community 6 - "BaseAgent & .constructor()"
Cohesion: 0.4
Nodes (1): BaseAgent

### Community 9 - "parseMarkdownToStages() & seed()"
Cohesion: 1.0
Nodes (2): parseMarkdownToStages(), seed()

### Community 17 - "enrich() & enrich_boilerplates.js"
Cohesion: 1.0
Nodes (1): enrich()

### Community 28 - "AI Interview Platform Architecture"
Cohesion: 1.0
Nodes (1): AI Interview Platform Architecture

### Community 29 - "Connection Error Fix"
Cohesion: 1.0
Nodes (1): Connection Error Fix

### Community 30 - "Database Analysis"
Cohesion: 1.0
Nodes (1): Database Analysis

### Community 31 - "Data Source Confirmation"
Cohesion: 1.0
Nodes (1): Data Source Confirmation

### Community 32 - "Debug Guide"
Cohesion: 1.0
Nodes (1): Debug Guide

### Community 33 - "Deployment Documentation"
Cohesion: 1.0
Nodes (1): Deployment Documentation

### Community 34 - "Deployment Guide"
Cohesion: 1.0
Nodes (1): Deployment Guide

### Community 35 - "Deployment Scripts"
Cohesion: 1.0
Nodes (1): Deployment Scripts

### Community 36 - "Deploy Cheatsheet"
Cohesion: 1.0
Nodes (1): Deploy Cheatsheet

### Community 37 - "Ngrok Deployment Cheatsheet"
Cohesion: 1.0
Nodes (1): Ngrok Deployment Cheatsheet

## Knowledge Gaps
- **10 isolated node(s):** `AI Interview Platform Architecture`, `Connection Error Fix`, `Database Analysis`, `Data Source Confirmation`, `Debug Guide` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `LogStreamer.js & LogStreamer`** (12 nodes): `LogStreamer.js`, `LogStreamer`, `.addLog()`, `.broadcast()`, `.constructor()`, `.detectLogLevel()`, `.getRecentLogs()`, `.readExistingLogs()`, `.readNewLogs()`, `.start()`, `.stop()`, `.subscribe()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ScorerAgent & .constructor()`** (9 nodes): `ScorerAgent`, `.constructor()`, `._generateLLMCritique()`, `.generateReport()`, `._scoreCommunication()`, `._scoreComplexity()`, `._scoreCorrectness()`, `._scoreDepth()`, `ScorerAgent.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `StateManager.js & StateManager`** (8 nodes): `StateManager.js`, `StateManager`, `.addMessage()`, `.constructor()`, `.getSummary()`, `.transitionTo()`, `.updateState()`, `._verifyCriteria()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `BaseAgent & .constructor()`** (5 nodes): `BaseAgent`, `.constructor()`, `.generateResponse()`, `._getSystemPrompt()`, `BaseAgent.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `parseMarkdownToStages() & seed()`** (3 nodes): `parseMarkdownToStages()`, `seed()`, `seed_system_design.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `enrich() & enrich_boilerplates.js`** (2 nodes): `enrich()`, `enrich_boilerplates.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `AI Interview Platform Architecture`** (1 nodes): `AI Interview Platform Architecture`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Connection Error Fix`** (1 nodes): `Connection Error Fix`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Database Analysis`** (1 nodes): `Database Analysis`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Data Source Confirmation`** (1 nodes): `Data Source Confirmation`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Debug Guide`** (1 nodes): `Debug Guide`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Deployment Documentation`** (1 nodes): `Deployment Documentation`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Deployment Guide`** (1 nodes): `Deployment Guide`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Deployment Scripts`** (1 nodes): `Deployment Scripts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Deploy Cheatsheet`** (1 nodes): `Deploy Cheatsheet`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Ngrok Deployment Cheatsheet`** (1 nodes): `Ngrok Deployment Cheatsheet`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `AI Interview Platform Architecture`, `Connection Error Fix`, `Database Analysis` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._