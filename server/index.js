require('dotenv').config();
const express = require('express');
const cors = require('cors');
const StateManager = require('./src/state/StateManager');
const InterviewerAgent = require('./src/agents/InterviewerAgent');
const ProctorAgent = require('./src/agents/ProctorAgent');
const ScorerAgent = require('./src/agents/ScorerAgent');
const LLMService = require('./src/services/LLMService');
const { Question } = require('./src/models/Question');
const { SYSTEM_DESIGN_QUESTIONS } = require('./src/data/system_design_questions');

const app = express();
app.use(cors());
app.use(express.json());

const sessions = new Map();
const interviewer = new InterviewerAgent();
const proctor = new ProctorAgent();
const scorer = new ScorerAgent();

app.get('/api/questions', async (req, res) => {
  try {
    const questions = await Question.findAll();
    // Map fields for frontend compatibility
    const mappedQuestions = questions.map(q => {
      const data = q.toJSON();
      return {
        ...data,
        description: data.statement || data.description,
        boilerplate: data.practice_scaffold || data.boilerplate,
        pattern: data.category || data.pattern,
        initial_probe: data.initial_probe
      };
    });
    res.json(mappedQuestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const getSession = (questionId, type = 'DSA') => {
  const id = questionId || 'default';
  if (!sessions.has(id)) {
    console.log(`Initializing new session for: ${id} (${type})`);
    sessions.set(id, new StateManager(type));
  }
  return sessions.get(id);
};

app.post('/api/session/start', (req, res) => {
  const { questionId, type } = req.body;
  const session = new StateManager(type || 'SYSTEM_DESIGN');
  sessions.set(questionId || 'default', session);
  res.json({ state: session.getSummary() });
});

app.post('/api/interviewer/init', async (req, res) => {
  const { question } = req.body;
  const session = getSession(question?.id, 'DSA');
  
  // Use pre-computed probe if available
  if (question?.initial_probe) {
    session.updateState({ currentHintIndex: 1, selectedQuestion: question });
    return res.json({ probe: question.initial_probe });
  }

  const result = await interviewer.generateInitialProbe(question);
  
  if (result.nextHintIndex !== undefined) {
    session.updateState({ currentHintIndex: result.nextHintIndex, selectedQuestion: question });
  }

  res.json({ probe: result.text || result });
});

app.post('/api/chat', async (req, res) => {
  const { message, selectedQuestion } = req.body;
  const session = getSession(selectedQuestion?.id, 'DSA');
  
  if (selectedQuestion) {
    session.updateState({ selectedQuestion });
  }

  // Add user message to history
  session.addMessage('user', message);

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendEvent = (type, data) => {
    res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
  };

  try {
    // Extract constraints in background/parallel
    const constraintsPromise = LLMService.extractConstraints(message, session.state.requirements || []);

    const currentSummary = session.getSummary();
    
    // Call agent with progress callback
    const aiResult = await interviewer.generateResponse(
      currentSummary, 
      message || '',
      (statusText) => sendEvent('status', { message: statusText })
    );

    const newConstraints = await constraintsPromise;

    if (newConstraints && newConstraints.length > 0) {
      const updatedReqs = [...(session.state.requirements || []), ...newConstraints];
      session.updateState({ requirements: updatedReqs });
    }
    
    let responseText = typeof aiResult === 'object' ? aiResult.text : aiResult;
    let responseCode = typeof aiResult === 'object' ? aiResult.code : null;
    let nextHintIndex = typeof aiResult === 'object' ? aiResult.nextHintIndex : null;

    if (nextHintIndex !== null) {
      session.updateState({ currentHintIndex: nextHintIndex });
    }

    session.updateState({ suggestedCode: responseCode });

    // Add AI response to history
    session.addMessage('assistant', responseText);

    // Send final result
    sendEvent('result', {
      response: responseText,
      code: responseCode,
      constraints: session.state.requirements,
      state: session.getSummary()
    });
    
    res.end();
  } catch (error) {
    console.error('Chat error:', error);
    sendEvent('error', { message: error.message });
    res.end();
  }
});

app.post('/api/code', async (req, res) => {
  const { code, selectedQuestion } = req.body;
  const session = getSession(selectedQuestion?.id, 'DSA');
  
  session.updateState({ 
    codeBuffer: code,
    selectedQuestion: selectedQuestion || session.state.selectedQuestion 
  });
  
  const feedback = await proctor.analyzeCode(code, { problem: selectedQuestion?.title });
  res.json({ feedback, state: session.getSummary() });
});

app.post('/api/feedback/ai', async (req, res) => {
  const { code, whiteboard, problem, type, questionId } = req.body;
  const session = getSession(questionId, 'DSA');
  
  let feedback;
  const context = {
    problem: problem || (session.state.selectedQuestion ? session.state.selectedQuestion.title : 'General Design')
  };

  if (type === 'whiteboard') {
    feedback = await LLMService.analyzeWhiteboard(whiteboard || [], context);
  } else {
    feedback = await LLMService.analyzeCode(code || session.state.codeBuffer, context);
  }
  
  res.json({ feedback, state: session.getSummary() });
});

app.post('/api/session/finish', async (req, res) => {
  const { questionId } = req.body;
  const session = getSession(questionId);
  const report = await scorer.generateReport(session.getSummary());
  session.transitionTo('EVALUATION');
  res.json({ report, state: session.getSummary() });
});

// ─── System Design Routes ──────────────────────────────────────────────────────

// GET all system design questions (metadata only, no stage answers)
app.get('/api/sd/questions', (req, res) => {
  const questions = SYSTEM_DESIGN_QUESTIONS.map(({ id, title, difficulty, category, description, stages }) => ({
    id,
    title,
    difficulty,
    category,
    description,
    stageCount: stages.length,
    stages: stages.map(({ id, name, icon, prompt, hint }) => ({ id, name, icon, prompt, hint }))
  }));
  res.json(questions);
});

// POST evaluate a user's answer for a specific stage — returns LLM-powered feedback + probe
app.post('/api/sd/stage/evaluate', async (req, res) => {
  const { questionId, stageId, userAnswer, whiteboardShapes } = req.body;

  const question = SYSTEM_DESIGN_QUESTIONS.find(q => q.id === questionId);
  if (!question) return res.status(404).json({ error: 'Question not found' });

  const stage = question.stages.find(s => s.id === stageId);
  if (!stage) return res.status(404).json({ error: 'Stage not found' });

  // Combine typed answer + any whiteboard text
  const whiteboardText = (whiteboardShapes || [])
    .filter(s => s.text)
    .map(s => s.text)
    .join(', ');

  const fullAnswer = [userAnswer, whiteboardText].filter(Boolean).join('\n\nWhiteboard: ');

  const prompt = `
You are a Senior Principal Engineer conducting a system design interview.

Problem: "${question.title}"
Stage: ${stage.name} (Stage ${stageId} of ${question.stages.length})

Stage Prompt given to candidate:
"${stage.prompt}"

Reference Answer Key Points:
${JSON.stringify(stage.referenceAnswer, null, 2)}

Candidate's Answer:
"${fullAnswer}"

Your job (following Socratic / Karpathy principles):
1. Identify what the candidate got RIGHT (be specific, 1-2 sentences max).
2. Identify the SINGLE most critical gap or misconception. Do NOT reveal the answer; nudge with a Socratic probe.
3. Determine if the candidate is ready to move to the next stage (score 1-5, where 3+ = ready).
4. Generate the follow-up probe question (based on stage.probeQuestion but adapted to what the candidate actually said).

Respond with ONLY a JSON object:
{
  "strengths": "...",
  "gap": "...",
  "probeQuestion": "...",
  "readinessScore": 1-5,
  "readyToAdvance": true/false,
  "microCritique": "1-2 sentence summary for the feedback panel"
}
`;

  try {
    const text = await LLMService.generateContent(prompt);
    const evaluation = JSON.parse(text.replace(/```json|```/g, '').trim());
    res.json({ evaluation, stage });
  } catch (error) {
    console.error('SD Stage Evaluate error:', error);
    // Fallback graceful evaluation
    res.json({
      evaluation: {
        strengths: 'Good start. You addressed key concepts.',
        gap: 'Think deeper about the scalability trade-offs.',
        probeQuestion: stage.probeQuestion,
        readinessScore: 3,
        readyToAdvance: true,
        microCritique: 'Decent coverage. Push for more specifics on bottlenecks.'
      },
      stage
    });
  }
});

// POST complete the system design interview — returns full rubric report
app.post('/api/sd/complete', async (req, res) => {
  const { questionId, stageAnswers } = req.body;
  const question = SYSTEM_DESIGN_QUESTIONS.find(q => q.id === questionId);
  if (!question) return res.status(404).json({ error: 'Question not found' });

  const prompt = `
You are a Senior Principal Engineer scoring a completed system design interview.

Problem: "${question.title}"
Candidate Answers by Stage:
${stageAnswers.map((a, i) => `Stage ${i + 1} (${question.stages[i]?.name}): "${a}"`).join('\n\n')}

Score the candidate on these rubric dimensions (0-100 each):
- Requirements Clarity: Did they define clear functional + non-functional requirements?
- Technical Depth: Did they go beyond surface-level into implementation details?
- Trade-off Reasoning: Did they justify their choices (e.g., 302 vs 301, hash vs counter)?
- Scalability Thinking: Did they address the scale requirements (1B URLs, 100M DAU)?
- Communication: Was the answer structured, clear, and systematic?

Return ONLY a JSON object:
{
  "rubric": {
    "Requirements Clarity": 0-100,
    "Technical Depth": 0-100,
    "Trade-off Reasoning": 0-100,
    "Scalability Thinking": 0-100,
    "Communication": 0-100
  },
  "overallScore": 0-100,
  "level": "Mid-Level | Senior | Staff+",
  "critique": "2-3 paragraph detailed critique with specific evidence from their answers.",
  "topStrengths": ["...", "..."],
  "topImprovement": "..."
}
`;

  try {
    const text = await LLMService.generateContent(prompt);
    const report = JSON.parse(text.replace(/```json|```/g, '').trim());
    res.json({ report });
  } catch (error) {
    console.error('SD complete error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3005;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});

