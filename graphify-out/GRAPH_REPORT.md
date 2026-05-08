# Graph Report - machine-learning  (2026-05-08)

## Corpus Check
- 55 files · ~314,198 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 200 nodes · 220 edges · 18 communities detected
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 19|Community 19]]

## God Nodes (most connected - your core abstractions)
1. `LLMService` - 13 edges
2. `LogStreamer` - 10 edges
3. `ScorerAgent` - 8 edges
4. `StateManager` - 7 edges
5. `main()` - 7 edges
6. `processProblem()` - 6 edges
7. `main()` - 6 edges
8. `InterviewerAgent` - 5 edges
9. `main()` - 5 edges
10. `BaseAgent` - 4 edges

## Surprising Connections (you probably didn't know these)
- `extractSection()` --calls--> `parseMarkdownToStages()`  [INFERRED]
  server/src/utils/sdSolutionSections.js → server/scripts/seed_system_design.js

## Communities

### Community 0 - "Community 0"
Cohesion: 0.28
Nodes (2): enrich(), LLMService

### Community 1 - "Community 1"
Cohesion: 0.2
Nodes (8): InterviewerAgent, isSystemDesignQuestion(), loadPromptFile(), truncate(), parseMarkdownToStages(), seed(), extractSection(), getOriginalSolutionSectionsForQuestion()

### Community 2 - "Community 2"
Cohesion: 0.17
Nodes (2): buildSdContext(), parseStagesFromSolutionFormat()

### Community 3 - "Community 3"
Cohesion: 0.24
Nodes (1): LogStreamer

### Community 4 - "Community 4"
Cohesion: 0.31
Nodes (9): enrichWithLLM(), extractFunctionParams(), fetchAllProblemSlugs(), fetchProblemViaGraphQL(), main(), parseExamples(), processProblem(), saveImagesToLocal() (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.36
Nodes (1): ScorerAgent

### Community 6 - "Community 6"
Cohesion: 0.42
Nodes (8): connectToCloudSQL(), downloadAndReplaceImages(), fetchFromLeetCode(), main(), respectfulDelay(), sleep(), titleToSlug(), updateProblemInDB()

### Community 7 - "Community 7"
Cohesion: 0.29
Nodes (2): getSdHeadingChipClass(), normalizeHeading()

### Community 8 - "Community 8"
Cohesion: 0.29
Nodes (1): StateManager

### Community 9 - "Community 9"
Cohesion: 0.52
Nodes (6): downloadAndReplaceImages(), fetchFromLeetCode(), main(), sleep(), titleToSlug(), updateViaSQL()

### Community 10 - "Community 10"
Cohesion: 0.6
Nodes (5): fetchFromLeetCode(), main(), sleep(), titleToSlug(), updateViaSQL()

### Community 11 - "Community 11"
Cohesion: 0.4
Nodes (1): BaseAgent

### Community 12 - "Community 12"
Cohesion: 0.7
Nodes (4): fetchProblem(), main(), saveToDatabase(), sleep()

### Community 14 - "Community 14"
Cohesion: 0.5
Nodes (1): SearchService

### Community 15 - "Community 15"
Cohesion: 0.5
Nodes (1): ProctorAgent

### Community 16 - "Community 16"
Cohesion: 0.83
Nodes (3): generateScaffold(), processQuestion(), run()

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (2): extractBoilerplate(), run()

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (2): generateScaffold(), run()

## Knowledge Gaps
- **Thin community `Community 0`** (16 nodes): `enrich()`, `enrich_boilerplates.js`, `LLMService.js`, `LLMService`, `.analyzeCode()`, `.analyzeGapAndSelectGuidance()`, `.analyzeWhiteboard()`, `.constructor()`, `.ensureSolutionExists()`, `.extractConstraints()`, `.fixJsonEscaping()`, `.generateChatResponse()`, `.generateContent()`, `.generateInitialProbe()`, `.generateReActResponse()`, `.loadSolutions()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 2`** (13 nodes): `buildSdContext()`, `escapeHtml()`, `getSession()`, `getSystemDesignSolutionFiles()`, `isSystemDesignQuestion()`, `index.js`, `mapQuestion()`, `parseStagesFromSolutionFormat()`, `pickRandomQuestion()`, `resolveSdMarkdownFile()`, `sendEvent()`, `startServer()`, `toTitleCaseFromSlug()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 3`** (11 nodes): `LogStreamer.js`, `LogStreamer`, `.addLog()`, `.broadcast()`, `.captureLog()`, `.constructor()`, `.detectLogLevel()`, `.getRecentLogs()`, `.start()`, `.stop()`, `.subscribe()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 5`** (9 nodes): `ScorerAgent`, `.constructor()`, `._generateLLMCritique()`, `.generateReport()`, `._scoreCommunication()`, `._scoreComplexity()`, `._scoreCorrectness()`, `._scoreDepth()`, `ScorerAgent.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (8 nodes): `SystemDesignView.jsx`, `EvaluationCard()`, `FinalReport()`, `getSdHeadingChipClass()`, `normalizeHeading()`, `normalizeSdMarkdown()`, `StageProgressBar()`, `SystemDesignView()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (8 nodes): `StateManager.js`, `StateManager`, `.addMessage()`, `.constructor()`, `.getSummary()`, `.transitionTo()`, `.updateState()`, `._verifyCriteria()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (5 nodes): `BaseAgent`, `.constructor()`, `.generateResponse()`, `._getSystemPrompt()`, `BaseAgent.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (4 nodes): `SearchService.js`, `SearchService`, `.constructor()`, `.performSearch()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (4 nodes): `ProctorAgent`, `.analyzeCode()`, `.constructor()`, `ProctorAgent.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (3 nodes): `extractBoilerplate()`, `run()`, `reset_boilerplates.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (3 nodes): `generateScaffold()`, `verify_3sum.js`, `run()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `enrichWithLLM()` connect `Community 4` to `Community 0`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._