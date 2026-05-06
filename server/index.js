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
const { PracticeSession } = require('./src/models/PracticeSession');

const path = require('path');
const LogStreamer = require('./src/services/LogStreamer');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

const sessions = new Map();
const interviewer = new InterviewerAgent();
const proctor = new ProctorAgent();
const scorer = new ScorerAgent();

const mapQuestion = (q) => {
  const data = q.toJSON ? q.toJSON() : q;
  return {
    ...data,
    description: data.description || data.statement,
    boilerplate: data.boilerplate || data.practice_scaffold,
    pattern: data.pattern || data.category,
  };
};

// Log streaming endpoint for debug bar
app.get('/api/logs/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  LogStreamer.subscribe(res);
});

// Health check endpoint for LM Studio
app.get('/api/health', async (req, res) => {
  console.log("\n🏥 Health Check Endpoint Called");
  try {
    // Try to verify LM Studio is responding
    const response = await LLMService.client.models.list();
    console.log("✅ LM Studio is responding");
    console.log(`📊 Available models:`, response.data ? response.data.map(m => m.id) : 'N/A');
    res.json({
      status: 'healthy',
      llmstudio: 'connected',
      models: response.data ? response.data.map(m => m.id) : [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Health Check Failed:", error.message);
    res.status(503).json({
      status: 'unhealthy',
      llmstudio: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
      hint: 'Make sure LM Studio is running on http://localhost:1234'
    });
  }
});

app.get('/api/questions', async (req, res) => {
  try {
    const questions = await Question.findAll();
    res.json(questions.map(mapQuestion));
  } catch (error) {
    console.error('Fetch questions error:', error);
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

  console.log("\n" + "=".repeat(60));
  console.log("💬 CHAT REQUEST RECEIVED");
  console.log("=".repeat(60));
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log(`📋 Question: ${selectedQuestion?.title || 'Unknown'}`);
  console.log(`💬 Message: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`);
  console.log(`🔖 Session ID: ${selectedQuestion?.id || 'default'}`);
  console.log("=".repeat(60));

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
    console.log(`📨 Sending event: ${type}`, data);
    res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
  };

  try {
    console.log("🔄 Starting constraint extraction and response generation...");
    // Extract constraints in background/parallel
    const constraintsPromise = LLMService.extractConstraints(message, session.state.requirements || []);

    const currentSummary = session.getSummary();

    console.log("🤖 Calling interviewer agent...");
    // Call agent with progress callback
    const aiResult = await interviewer.generateResponse(
      currentSummary,
      message || '',
      (statusText) => {
        console.log(`📊 Progress: ${statusText}`);
        sendEvent('status', { message: statusText });
      }
    );

    console.log("✅ AI Response generated successfully");
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
    
    console.log("✨ Chat response completed successfully\n");
    res.end();
  } catch (error) {
    console.error("\n" + "❌".repeat(30));
    console.error("🚨 CHAT ERROR 🚨");
    console.error("❌".repeat(30));
    console.error(`⏰ Time: ${new Date().toISOString()}`);
    console.error(`💬 Error Message: ${error.message}`);
    console.error(`📍 Error Type: ${error.constructor.name}`);
    console.error(`🔧 Full Error:`, error);
    console.error("❌".repeat(30) + "\n");

    if (error.message.includes('ECONNREFUSED') || error.message.includes('LM Studio')) {
      sendEvent('error', {
        message: 'LM Studio connection failed. Please ensure LM Studio is running on localhost:1234',
        type: 'connection_error'
      });
    } else {
      sendEvent('error', { message: error.message });
    }
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

// ─── Practice Routes ──────────────────────────────────────────────────────────

app.post('/api/practice/generate', async (req, res) => {
  try {
    const { newPerDay, pastPerDay, duration } = req.body;
    const allQuestions = await Question.findAll();

    // Filter to: medium/hard, DSA only (exclude System Design), prefer neetcode links
    const filtered = allQuestions.filter(q => {
      const difficulty = q.difficulty?.toLowerCase() || 'medium';
      const category = q.category || '';
      // Only include DSA problems, exclude System Design
      return (difficulty === 'medium' || difficulty === 'hard') && category !== 'System Design';
    }).map(mapQuestion);

    // Separate questions by neetcode availability for weighted selection
    const questionsWithNeetcode = filtered.filter(q => q.neetcode_url);
    const questionsWithoutNeetcode = filtered.filter(q => !q.neetcode_url);

    const pickRandomQuestion = (availablePool, usedIds) => {
      const available = availablePool.filter(q => !usedIds.includes(q.id));
      if (available.length === 0) return null;
      return available[Math.floor(Math.random() * available.length)];
    };

    // Generate 30-day schedule with spaced repetition
    const schedule = {};
    const usedQuestions = [];
    const questionFrequency = {};

    for (let day = 1; day <= (duration || 30); day++) {
      schedule[day] = [];

      // Add new questions (prefer neetcode, fall back to others)
      let newQuestionsToAdd = newPerDay;
      while (newQuestionsToAdd > 0 && usedQuestions.length < filtered.length) {
        let q = pickRandomQuestion(questionsWithNeetcode, usedQuestions);
        if (!q) {
          q = pickRandomQuestion(questionsWithoutNeetcode, usedQuestions);
        }
        if (q) {
          schedule[day].push(q);
          usedQuestions.push(q.id);
          questionFrequency[q.id] = [day];
          newQuestionsToAdd--;
        } else {
          break;
        }
      }

      // Add past questions for spaced repetition (skip day 1)
      if (day > 1) {
        const pastCandidates = usedQuestions.filter(qId => {
          const lastDay = (questionFrequency[qId] || []).slice(-1)[0];
          return lastDay < day && (questionFrequency[qId]?.length || 0) < 3;
        });

        let pastQuestionsToAdd = Math.min(pastPerDay, pastCandidates.length);
        const selectedPast = new Set();

        while (pastQuestionsToAdd > 0 && pastCandidates.length > 0) {
          const randomIdx = Math.floor(Math.random() * pastCandidates.length);
          const qId = pastCandidates[randomIdx];

          if (!selectedPast.has(qId)) {
            const q = filtered.find(fq => fq.id === qId);
            if (q) {
              schedule[day].push(q);
              selectedPast.add(qId);
              questionFrequency[qId].push(day);
              pastQuestionsToAdd--;
            }
          }
        }
      }
    }

    res.json({
      schedule,
      progress: {},
      totalQuestions: filtered.length,
      selectedQuestions: usedQuestions.length
    });
  } catch (error) {
    console.error('Generate practice schedule error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save practice session to database
app.post('/api/practice/save', async (req, res) => {
  try {
    const { sessionName, schedule, newPerDay, pastPerDay } = req.body;

    // Convert schedule to ID-only format to reduce payload
    const idOnlySchedule = {};
    Object.entries(schedule).forEach(([day, questions]) => {
      idOnlySchedule[day] = questions.map(q => q.id || q);
    });

    const session = await PracticeSession.create({
      sessionName,
      schedule: idOnlySchedule,
      newPerDay,
      pastPerDay,
      progress: {}
    });

    res.json({ success: true, session });
  } catch (error) {
    console.error('Save practice session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all practice sessions
app.get('/api/practice/sessions', async (req, res) => {
  try {
    const sessions = await PracticeSession.findAll({
      attributes: ['id', 'sessionName', 'newPerDay', 'pastPerDay', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json(sessions);
  } catch (error) {
    console.error('Fetch practice sessions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific practice session (with full question data)
app.get('/api/practice/session/:id', async (req, res) => {
  try {
    const session = await PracticeSession.findByPk(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Parse schedule if it's a string
    let schedule = session.schedule;
    if (typeof schedule === 'string') {
      schedule = JSON.parse(schedule);
    }

    // Fetch full question data based on IDs in schedule
    const allQuestions = await Question.findAll();
    const questionMap = {};
    allQuestions.forEach(q => {
      const mapped = mapQuestion(q);
      questionMap[q.id] = mapped;
    });

    // Reconstruct schedule with full question data
    const fullSchedule = {};
    Object.entries(schedule).forEach(([day, questionIds]) => {
      fullSchedule[day] = questionIds
        .map(qId => questionMap[qId])
        .filter(q => q); // Filter out any missing questions
    });

    const sessionData = session.toJSON();
    sessionData.schedule = fullSchedule;

    res.json(sessionData);
  } catch (error) {
    console.error('Fetch practice session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update practice session progress
app.put('/api/practice/session/:id/progress', async (req, res) => {
  try {
    const { progress } = req.body;
    const session = await PracticeSession.findByPk(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.progress = progress;
    await session.save();
    res.json({ success: true, session });
  } catch (error) {
    console.error('Update practice session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rename a practice session
app.put('/api/practice/session/:id/rename', async (req, res) => {
  try {
    const { newName } = req.body;
    const session = await PracticeSession.findByPk(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.sessionName = newName;
    await session.save();
    res.json({ success: true, session });
  } catch (error) {
    console.error('Rename practice session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete/reset a practice session
app.delete('/api/practice/session/:id', async (req, res) => {
  try {
    const session = await PracticeSession.findByPk(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await session.destroy();
    res.json({ success: true, message: 'Session deleted' });
  } catch (error) {
    console.error('Delete practice session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── System Design Routes ──────────────────────────────────────────────────────

// GET all system design questions (metadata only, no stage answers)
// GET all system design questions (metadata only, no stage answers)
app.get('/api/sd/questions', async (req, res) => {
  try {
    const questions = await Question.findAll({ where: { category: 'System Design' } });
    const mappedQuestions = questions.map(q => {
      const data = q.toJSON();
      let parsed = [];
      let stages = [];
      let originalUrl = '';
      try { parsed = JSON.parse(data.solution_format || '[]'); } catch(e) {}
      
      if (!Array.isArray(parsed) && parsed.stages) {
        stages = parsed.stages;
        originalUrl = parsed.originalUrl || '';
      } else {
        stages = parsed;
      }
      
      return {
        id: data.id,
        title: data.title,
        difficulty: data.difficulty || 'Medium',
        category: data.category,
        description: data.statement,
        originalUrl,
        neetcode_url: data.neetcode_url,
        youtube_url: data.youtube_url,
        stageCount: stages.length,
        stages: stages.map(({ id, name, icon, prompt, hint }) => ({ id, name, icon, prompt, hint }))
      };
    });
    res.json(mappedQuestions);
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// POST evaluate a user's answer for a specific stage — returns LLM-powered feedback + probe
app.post('/api/sd/stage/evaluate', async (req, res) => {
  const { questionId, stageId, userAnswer, whiteboardShapes } = req.body;

  const questionRaw = await Question.findOne({ where: { id: questionId } });
  if (!questionRaw) return res.status(404).json({ error: 'Question not found' });
  
  const question = questionRaw.toJSON();
  let parsed = [];
  let stages = [];
  try { parsed = JSON.parse(question.solution_format || '[]'); } catch(e) {}
  
  if (!Array.isArray(parsed) && parsed.stages) {
    stages = parsed.stages;
  } else {
    stages = parsed;
  }

  const stage = stages.find(s => s.id === stageId);
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
Stage: ${stage.name} (Stage ${stageId} of ${stages.length})

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
  const questionRaw = await Question.findOne({ where: { id: questionId } });
  if (!questionRaw) return res.status(404).json({ error: 'Question not found' });
  const question = questionRaw.toJSON();
  let parsed = [];
  let stages = [];
  try { parsed = JSON.parse(question.solution_format || '[]'); } catch(e) {}
  
  if (!Array.isArray(parsed) && parsed.stages) {
    stages = parsed.stages;
  } else {
    stages = parsed;
  }

  const prompt = `
You are a Senior Principal Engineer scoring a completed system design interview.

Problem: "${question.title}"
Candidate Answers by Stage:
${stageAnswers.map((a, i) => `Stage ${i + 1} (${stages[i]?.name}): "${a}"`).join('\n\n')}

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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Start log streamer
LogStreamer.start();

const PORT = process.env.PORT || 3005;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`📊 Log streaming available at /api/logs/stream`);
});

