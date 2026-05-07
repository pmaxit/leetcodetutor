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
const { QuestionStatus } = require('./src/models/QuestionStatus');
const { User } = require('./src/models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticateToken, JWT_SECRET } = require('./src/middleware/auth');

const path = require('path');
const fs = require('fs');
const LogStreamer = require('./src/services/LogStreamer');
const {
  SD_SOLUTIONS_DIR,
  getOriginalSolutionSectionsForQuestion,
} = require('./src/utils/sdSolutionSections');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const MAX_WHITEBOARD_SNAPSHOT_BYTES = 1_000_000;

const escapeHtml = (value = '') =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const toTitleCaseFromSlug = (slug = '') =>
  slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getSystemDesignSolutionFiles = () => {
  if (!fs.existsSync(SD_SOLUTIONS_DIR)) return [];

  return fs
    .readdirSync(SD_SOLUTIONS_DIR)
    .filter((fileName) => /^problem-breakdowns-.*\.md$/.test(fileName))
    .sort((a, b) => a.localeCompare(b));
};

const resolveSdMarkdownFile = (rawSlug = '') => {
  const normalized = String(rawSlug || '').trim().toLowerCase();
  if (!/^[a-z0-9-]+$/.test(normalized)) return null;

  const candidates = [
    normalized,
    `problem-breakdowns-${normalized}`,
    `core-concepts-${normalized}`,
    `deep-dives-${normalized}`,
    `patterns-${normalized}`,
    `in-a-hurry-${normalized}`,
  ];

  for (const slug of candidates) {
    const filePath = path.join(SD_SOLUTIONS_DIR, `${slug}.md`);
    if (fs.existsSync(filePath)) return { slug, filePath };
  }

  const allMarkdown = fs.existsSync(SD_SOLUTIONS_DIR)
    ? fs.readdirSync(SD_SOLUTIONS_DIR).filter((name) => name.endsWith('.md'))
    : [];
  const suffixMatch = allMarkdown.find((fileName) => fileName.endsWith(`-${normalized}.md`));
  if (suffixMatch) {
    const slug = suffixMatch.replace('.md', '');
    return {
      slug,
      filePath: path.join(SD_SOLUTIONS_DIR, suffixMatch),
    };
  }

  return null;
};

const isSystemDesignQuestion = (question) => {
  if (!question) return false;
  const category = (question.category || question.pattern || '').toString().toLowerCase();
  return category.includes('system design');
};

const parseStagesFromSolutionFormat = (solutionFormat) => {
  let parsed = [];
  try {
    parsed = JSON.parse(solutionFormat || '[]');
  } catch (e) {
    return [];
  }
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.stages)) return parsed.stages;
  return [];
};

const buildSdContext = async (selectedQuestion, stageId, whiteboardShapes) => {
  if (!selectedQuestion?.id) return null;
  try {
    const questionRaw = await Question.findOne({ where: { id: selectedQuestion.id } });
    if (!questionRaw) return null;
    const questionData = questionRaw.toJSON();

    const stages = parseStagesFromSolutionFormat(questionData.solution_format);
    const currentStage = stageId
      ? stages.find((s) => String(s.id) === String(stageId)) || null
      : null;

    const whiteboardText = (whiteboardShapes || [])
      .filter((s) => s && s.text)
      .map((s) => s.text)
      .join(', ');

    return {
      stages: stages.map(({ id, name, icon, prompt }) => ({ id, name, icon, prompt })),
      currentStage,
      whiteboardText,
    };
  } catch (error) {
    console.error('Failed to build SD context:', error.message);
    return null;
  }
};

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
      llm: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
      hint: 'Check OpenRouter API key in .env and your internet connection'
    });
  }
});

app.get('/api/questions', authenticateToken, async (req, res) => {
  try {
    const questions = await Question.findAll();
    res.json(questions.map(mapQuestion));
  } catch (error) {
    console.error('Fetch questions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Auth endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all question statuses as object
app.get('/api/question-status', authenticateToken, async (req, res) => {
  try {
    const statuses = await QuestionStatus.findAll({ where: { user_id: req.user.id } });
    const statusMap = {};
    statuses.forEach(s => {
      statusMap[s.question_id] = {
        status: s.status,
        user_code: s.user_code,
        whiteboard_snapshot: s.whiteboard_snapshot || null
      };
    });
    res.json(statusMap);
  } catch (error) {
    console.error('Fetch question status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update question status (create or update)
app.put('/api/question-status/:questionId', authenticateToken, async (req, res) => {
  try {
    const { questionId } = req.params;
    const { status } = req.body;

    if (!['needs_review', 'done'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const [statusRecord] = await QuestionStatus.findOrCreate({
      where: { question_id: questionId, user_id: req.user.id },
      defaults: { status, updatedAt: new Date() }
    });

    if (!statusRecord.isNewRecord) {
      statusRecord.status = status;
      statusRecord.updatedAt = new Date();
      await statusRecord.save();
    }

    res.json({ success: true, questionId, status });
  } catch (error) {
    console.error('Update question status error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/question-status/:questionId/whiteboard', authenticateToken, async (req, res) => {
  try {
    const { questionId } = req.params;
    const { whiteboardSnapshot } = req.body;

    if (whiteboardSnapshot !== null && whiteboardSnapshot !== undefined) {
      const bytes = Buffer.byteLength(JSON.stringify(whiteboardSnapshot), 'utf8');
      if (bytes > MAX_WHITEBOARD_SNAPSHOT_BYTES) {
        return res.status(413).json({ error: 'Whiteboard snapshot exceeds 1MB limit' });
      }
    }

    const [statusRecord] = await QuestionStatus.findOrCreate({
      where: { question_id: questionId, user_id: req.user.id },
      defaults: {
        status: 'needs_review',
        whiteboard_snapshot: whiteboardSnapshot ?? null,
        updatedAt: new Date()
      }
    });

    if (!statusRecord.isNewRecord) {
      statusRecord.whiteboard_snapshot = whiteboardSnapshot ?? null;
      statusRecord.updatedAt = new Date();
      await statusRecord.save();
    }

    res.json({ success: true, questionId });
  } catch (error) {
    console.error('Update whiteboard snapshot error:', error);
    res.status(500).json({ error: error.message });
  }
});

const getSession = (questionId, userId, type = 'DSA') => {
  const id = `${userId || 'default'}_${questionId || 'default'}`;
  if (!sessions.has(id)) {
    console.log(`Initializing new session for: ${id} (${type})`);
    sessions.set(id, new StateManager(type));
  }
  const session = sessions.get(id);
  if (type && session.type !== type) {
    session.type = type;
  }
  return session;
};

app.post('/api/session/start', authenticateToken, (req, res) => {
  const { questionId, type } = req.body;
  const session = new StateManager(type || 'SYSTEM_DESIGN');
  const sessionId = `${req.user.id}_${questionId || 'default'}`;
  sessions.set(sessionId, session);
  res.json({ state: session.getSummary() });
});

app.post('/api/interviewer/init', authenticateToken, async (req, res) => {
  const { question } = req.body;
  const isSD = isSystemDesignQuestion(question);
  const sessionType = isSD ? 'SYSTEM_DESIGN' : 'DSA';
  const session = getSession(question?.id, req.user.id, sessionType);

  // For DSA, prefer the pre-computed probe if available.
  if (!isSD && question?.initial_probe) {
    session.updateState({ currentHintIndex: 1, selectedQuestion: question });
    return res.json({ probe: question.initial_probe });
  }

  const result = await interviewer.generateInitialProbe(question, sessionType);

  if (result.nextHintIndex !== undefined) {
    session.updateState({ currentHintIndex: result.nextHintIndex, selectedQuestion: question });
  } else {
    session.updateState({ selectedQuestion: question });
  }

  res.json({ probe: result.text || result });
});

app.post('/api/chat', authenticateToken, async (req, res) => {
  const { message, selectedQuestion, stageId, whiteboardShapes } = req.body;
  const isSD = isSystemDesignQuestion(selectedQuestion);
  const sessionType = isSD ? 'SYSTEM_DESIGN' : 'DSA';
  const session = getSession(selectedQuestion?.id, req.user.id, sessionType);

  console.log("\n" + "=".repeat(60));
  console.log(`💬 CHAT REQUEST RECEIVED (User: ${req.user.id}, Mode: ${sessionType})`);
  console.log("=".repeat(60));
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log(`📋 Question: ${selectedQuestion?.title || 'Unknown'}`);
  console.log(`💬 Message: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`);
  console.log(`🔖 Session ID: ${req.user.id}_${selectedQuestion?.id || 'default'}`);
  if (isSD) {
    console.log(`🧱 SD stage: ${stageId || 'none'} | whiteboard shapes: ${(whiteboardShapes || []).length}`);
  }
  console.log("=".repeat(60));


  if (selectedQuestion) {
    session.updateState({ selectedQuestion });
  }

  if (isSD) {
    const sdContext = await buildSdContext(selectedQuestion, stageId, whiteboardShapes);
    session.updateState({ sdContext });
  } else {
    session.updateState({ sdContext: null });
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
    // Constraint extraction is DSA-specific; SD already grounds via stage context.
    const constraintsPromise = isSD
      ? Promise.resolve([])
      : LLMService.extractConstraints(message, session.state.requirements || []);

    const currentSummary = session.getSummary();

    console.log("🤖 Calling interviewer agent...");
    // Call agent with progress callback
    const aiResult = await interviewer.generateResponse(
      currentSummary,
      message || '',
      (statusText, modelId) => {
        console.log(`📊 Progress: ${statusText} [${modelId || 'N/A'}]`);
        sendEvent('status', { message: statusText, model: modelId });
      },
      (delta) => {
        sendEvent('delta', { delta });
      }
    );

    console.log("✅ AI Response generated successfully");
    const newConstraints = await constraintsPromise;

    if (!isSD && newConstraints && newConstraints.length > 0) {
      const updatedReqs = [...(session.state.requirements || []), ...newConstraints];
      session.updateState({ requirements: updatedReqs });
    }
    
    let responseText = typeof aiResult === 'object' ? aiResult.text : aiResult;
    let responseCode = typeof aiResult === 'object' ? aiResult.code : null;
    let nextHintIndex = typeof aiResult === 'object' ? aiResult.nextHintIndex : null;
    let modelUsed = typeof aiResult === 'object' ? aiResult.model : null;

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
      state: session.getSummary(),
      model: modelUsed
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

    if (error.message.includes('ECONNREFUSED') || error.message.includes('OpenRouter') || error.message.includes('401') || error.message.includes('403')) {
      sendEvent('error', {
        message: 'OpenRouter connection failed. Check your OPENROUTER_API_KEY in .env',
        type: 'connection_error'
      });
    } else {
      sendEvent('error', { message: error.message });
    }
    res.end();
  }
});

const codeDebounceTimers = new Map();

app.post('/api/code', authenticateToken, async (req, res) => {
  const { code, selectedQuestion } = req.body;
  const session = getSession(selectedQuestion?.id, req.user.id, 'DSA');

  session.updateState({
    codeBuffer: code,
    selectedQuestion: selectedQuestion || session.state.selectedQuestion
  });

  if (selectedQuestion?.id) {
    const timerId = `${req.user.id}_${selectedQuestion.id}`;

    // Clear previous timer
    if (codeDebounceTimers.has(timerId)) {
      clearTimeout(codeDebounceTimers.get(timerId));
    }

    // Set new debounced save (500ms delay)
    const timer = setTimeout(async () => {
      try {
        const [statusRecord] = await QuestionStatus.findOrCreate({
          where: { question_id: selectedQuestion.id, user_id: req.user.id },
          defaults: { status: 'needs_review', user_code: code, updatedAt: new Date() }
        });
        if (!statusRecord.isNewRecord) {
          statusRecord.user_code = code;
          statusRecord.updatedAt = new Date();
          await statusRecord.save();
        }
      } catch (err) {
        console.error('Failed to save user code:', err);
      }
      codeDebounceTimers.delete(timerId);
    }, 500);

    codeDebounceTimers.set(timerId, timer);
  }

  const feedback = await proctor.analyzeCode(code, { problem: selectedQuestion?.title });
  res.json({ feedback, state: session.getSummary() });
});

app.post('/api/code/reset', authenticateToken, async (req, res) => {
  const { questionId } = req.body;
  try {
    const statusRecord = await QuestionStatus.findOne({
      where: { question_id: questionId, user_id: req.user.id }
    });
    if (statusRecord) {
      statusRecord.user_code = null;
      statusRecord.whiteboard_snapshot = null;
      await statusRecord.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/code/reset-all', authenticateToken, async (req, res) => {
  try {
    await QuestionStatus.update(
      { user_code: null, whiteboard_snapshot: null },
      { where: { user_id: req.user.id } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/feedback/ai', authenticateToken, async (req, res) => {
  const { code, whiteboard, problem, type, questionId } = req.body;
  const session = getSession(questionId, req.user.id, 'DSA');
  
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

app.post('/api/session/finish', authenticateToken, async (req, res) => {
  const { questionId } = req.body;
  const session = getSession(questionId, req.user.id);
  const report = await scorer.generateReport(session.getSummary());
  session.transitionTo('EVALUATION');
  res.json({ report, state: session.getSummary() });
});

// ─── Practice Routes ──────────────────────────────────────────────────────────

app.post('/api/practice/generate', authenticateToken, async (req, res) => {
  try {
    const { newPerDay, pastPerDay, duration } = req.body;

    if (!newPerDay || !pastPerDay) {
      return res.status(400).json({ error: 'Missing required parameters: newPerDay, pastPerDay' });
    }

    const allQuestions = await Question.findAll();

    if (!allQuestions || allQuestions.length === 0) {
      return res.status(400).json({ error: 'No questions available in database' });
    }

    // Filter to: medium/hard, DSA only (exclude System Design), prefer neetcode links
    const filtered = allQuestions.filter(q => {
      const difficulty = q.difficulty?.toLowerCase() || 'medium';
      const category = q.category || '';
      // Only include DSA problems, exclude System Design
      return (difficulty === 'medium' || difficulty === 'hard') && category !== 'System Design';
    }).map(mapQuestion);

    if (filtered.length === 0) {
      return res.status(400).json({ error: 'No medium/hard DSA problems found in database' });
    }

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
    console.error('❌ Generate practice schedule error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      error: error.message,
      type: error.name,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Save practice session to database
app.post('/api/practice/save', authenticateToken, async (req, res) => {
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
      userId: req.user.id,
      progress: {}
    });

    // Reset all code when creating a new session
    await QuestionStatus.update(
      { user_code: null, whiteboard_snapshot: null },
      { where: { user_id: req.user.id } }
    );

    res.json({ success: true, session });
  } catch (error) {
    console.error('Save practice session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all practice sessions
app.get('/api/practice/sessions', authenticateToken, async (req, res) => {
  try {
    const sessions = await PracticeSession.findAll({
      where: { userId: req.user.id },
      attributes: ['id', 'sessionName', 'newPerDay', 'pastPerDay', 'userId', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json(sessions);
  } catch (error) {
    console.error('Fetch practice sessions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific practice session (with full question data)
app.get('/api/practice/session/:id', authenticateToken, async (req, res) => {
  try {
    const session = await PracticeSession.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
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
app.put('/api/practice/session/:id/progress', authenticateToken, async (req, res) => {
  try {
    const { progress } = req.body;
    const session = await PracticeSession.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
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
app.put('/api/practice/session/:id/rename', authenticateToken, async (req, res) => {
  try {
    const { newName } = req.body;
    const session = await PracticeSession.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
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
app.delete('/api/practice/session/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  console.log(`🗑 DELETE request for session ${id} from user ${req.user.id}`);
  try {
    const session = await PracticeSession.findOne({
      where: { id, userId: req.user.id }
    });
    if (!session) {
      console.log(`❌ Session ${id} not found for user ${req.user.id}`);
      return res.status(404).json({ error: 'Session not found' });
    }

    await session.destroy();
    console.log(`✅ Session ${id} deleted successfully`);
    
    // Reset all code when resetting a session
    await QuestionStatus.update(
      { user_code: null, whiteboard_snapshot: null },
      { where: { user_id: req.user.id } }
    );
    
    res.json({ success: true, message: 'Session deleted' });
  } catch (error) {
    console.error('Delete practice session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── System Design Routes ──────────────────────────────────────────────────────

// GET all system design questions (metadata only, no stage answers)
// GET all system design questions (metadata only, no stage answers)
app.get('/api/sd/questions', authenticateToken, async (req, res) => {
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

      // Derive solution slug: from originalUrl last two segments, or title, then verify it exists
      let solutionSlug = null;
      if (originalUrl) {
        const segments = originalUrl.split('/').filter(Boolean);
        if (segments.length >= 2) {
          solutionSlug = `${segments[segments.length - 2]}-${segments[segments.length - 1]}`.toLowerCase();
        } else if (segments.length === 1) {
          solutionSlug = segments[0].toLowerCase();
        }
      }
      // Fallback: derive from title if no originalUrl or URL parsing failed
      if (!solutionSlug) {
        const titleSlug = (data.title || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        if (titleSlug) solutionSlug = titleSlug;
      }

      return {
        id: data.id,
        title: data.title,
        difficulty: data.difficulty || 'Medium',
        category: data.category,
        description: data.statement,
        originalUrl,
        solutionSlug,
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

app.get('/api/sd/draft', authenticateToken, async (req, res) => {
  try {
    const statuses = await QuestionStatus.findAll({ where: { user_id: req.user.id } });
    const draftMap = {};

    statuses.forEach((status) => {
      if (!status.user_code && !status.whiteboard_snapshot) return;
      let draftState = null;
      try {
        draftState = status.user_code ? JSON.parse(status.user_code) : null;
      } catch (error) {
        draftState = null;
      }

      if (!draftState || typeof draftState !== 'object' || draftState.__kind !== 'sd_draft') {
        return;
      }

      draftMap[status.question_id] = {
        draftState,
        whiteboardSnapshot: status.whiteboard_snapshot || null,
      };
    });

    res.json(draftMap);
  } catch (error) {
    console.error('Fetch SD drafts error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sd/draft/:questionId', authenticateToken, async (req, res) => {
  try {
    const { questionId } = req.params;
    const statusRecord = await QuestionStatus.findOne({
      where: { question_id: questionId, user_id: req.user.id },
    });

    if (!statusRecord?.user_code) {
      return res.json({ draftState: null, whiteboardSnapshot: null });
    }

    let draftState = null;
    try {
      draftState = JSON.parse(statusRecord.user_code);
    } catch (error) {
      draftState = null;
    }

    if (!draftState || typeof draftState !== 'object' || draftState.__kind !== 'sd_draft') {
      return res.json({ draftState: null, whiteboardSnapshot: null });
    }

    res.json({
      draftState,
      whiteboardSnapshot: statusRecord.whiteboard_snapshot || null,
    });
  } catch (error) {
    console.error('Fetch SD draft error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/sd/draft/:questionId', authenticateToken, async (req, res) => {
  try {
    const { questionId } = req.params;
    const { draftState, whiteboardSnapshot } = req.body;

    if (!draftState || typeof draftState !== 'object') {
      return res.status(400).json({ error: 'Invalid draft state' });
    }

    if (whiteboardSnapshot !== null && whiteboardSnapshot !== undefined) {
      const bytes = Buffer.byteLength(JSON.stringify(whiteboardSnapshot), 'utf8');
      if (bytes > MAX_WHITEBOARD_SNAPSHOT_BYTES) {
        return res.status(413).json({ error: 'Whiteboard snapshot exceeds 1MB limit' });
      }
    }

    const persistedState = {
      __kind: 'sd_draft',
      currentStageIndex: Number.isInteger(draftState.currentStageIndex) ? draftState.currentStageIndex : 0,
      stageAnswers: Array.isArray(draftState.stageAnswers) ? draftState.stageAnswers : [],
      completedStages: Array.isArray(draftState.completedStages) ? draftState.completedStages : [],
      savedAt: new Date().toISOString(),
    };

    const [statusRecord] = await QuestionStatus.findOrCreate({
      where: { question_id: questionId, user_id: req.user.id },
      defaults: {
        status: 'needs_review',
        user_code: JSON.stringify(persistedState),
        whiteboard_snapshot: whiteboardSnapshot ?? null,
        updatedAt: new Date(),
      },
    });

    if (!statusRecord.isNewRecord) {
      statusRecord.user_code = JSON.stringify(persistedState);
      statusRecord.whiteboard_snapshot = whiteboardSnapshot ?? null;
      statusRecord.updatedAt = new Date();
      await statusRecord.save();
    }

    res.json({ success: true, questionId });
  } catch (error) {
    console.error('Save SD draft error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sd/draft/reset', authenticateToken, async (req, res) => {
  try {
    const { questionId } = req.body;
    if (!questionId) {
      return res.status(400).json({ error: 'questionId is required' });
    }

    const statusRecord = await QuestionStatus.findOne({
      where: { question_id: questionId, user_id: req.user.id },
    });

    if (!statusRecord) {
      return res.json({ success: true });
    }

    let parsed = null;
    try {
      parsed = statusRecord.user_code ? JSON.parse(statusRecord.user_code) : null;
    } catch (error) {
      parsed = null;
    }

    if (parsed?.__kind === 'sd_draft') {
      statusRecord.user_code = null;
      statusRecord.whiteboard_snapshot = null;
      statusRecord.updatedAt = new Date();
      await statusRecord.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Reset SD draft error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST evaluate a user's answer for a specific stage — returns LLM-powered feedback + probe
app.post('/api/sd/stage/evaluate', authenticateToken, async (req, res) => {
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
  const originalSections = getOriginalSolutionSectionsForQuestion(question);
  const stageSource = originalSections?.[stageId] || '';

  // Combine typed answer + whiteboard signal (labels/text + non-text components)
  const whiteboardLines = (whiteboardShapes || [])
    .map((shape, idx) => {
      const type = shape?.type || 'unknown';
      const text = (shape?.text || shape?.label || '').trim();
      if (text) return `${idx + 1}. [${type}] ${text}`;
      return `${idx + 1}. [${type}]`;
    })
    .filter(Boolean);
  const whiteboardSummary = whiteboardLines.length
    ? whiteboardLines.join('\n')
    : '';

  const fullAnswer = [
    userAnswer?.trim() ? `Typed Answer:\n${userAnswer.trim()}` : '',
    whiteboardSummary ? `Whiteboard Content:\n${whiteboardSummary}` : ''
  ].filter(Boolean).join('\n\n');

  const prompt = `
You are a Senior Principal Engineer conducting a system design interview.

Problem: "${question.title}"
Stage: ${stage.name} (Stage ${stageId} of ${stages.length})

Stage Prompt given to candidate:
"${stage.prompt}"

Reference Answer Key Points:
${JSON.stringify(stage.referenceAnswer, null, 2)}

Original Solution Section (Ground Truth for this stage):
${stageSource ? stageSource.substring(0, 5000) : 'Not available'}

Candidate's Combined Submission (typed + whiteboard):
${fullAnswer || 'No answer provided.'}

Your job (following Socratic / Karpathy principles):
1. Identify what the candidate got RIGHT (be specific, 1-2 sentences max).
2. Identify the SINGLE most critical gap or misconception. Do NOT reveal the answer; nudge with a Socratic probe.
3. Determine if the candidate is ready to move to the next stage (score 1-5, where 3+ = ready).
4. Generate the follow-up probe question (based on stage.probeQuestion but adapted to what the candidate actually said).
5. Include at least one explicit design trade-off in the critique (pros/cons).

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
app.post('/api/sd/complete', authenticateToken, async (req, res) => {
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

app.get('/api/sd/solutions', authenticateToken, (req, res) => {
  try {
    const files = getSystemDesignSolutionFiles();
    const solutions = files.map((fileName) => {
      const slug = fileName.replace('.md', '');
      return {
        slug,
        title: toTitleCaseFromSlug(slug.replace('problem-breakdowns-', '')),
        url: `/sd/solutions/${slug}`
      };
    });

    res.json({ solutions });
  } catch (error) {
    console.error('Failed to list system design solution pages:', error);
    res.status(500).json({ error: 'Failed to load solution pages' });
  }
});

app.get('/api/sd/solutions/:slug/markdown', authenticateToken, (req, res) => {
  try {
    const { slug } = req.params;
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({ error: 'Invalid solution slug' });
    }

    const resolved = resolveSdMarkdownFile(slug);
    if (!resolved) {
      return res.status(404).json({ error: 'Solution not found' });
    }

    const markdown = fs.readFileSync(resolved.filePath, 'utf8');
    const title = toTitleCaseFromSlug(
      resolved.slug
        .replace('problem-breakdowns-', '')
        .replace('core-concepts-', '')
        .replace('deep-dives-', '')
        .replace('patterns-', '')
        .replace('in-a-hurry-', '')
    );
    return res.json({
      slug: resolved.slug,
      title,
      markdown,
    });
  } catch (error) {
    console.error('Failed to load markdown solution:', error);
    return res.status(500).json({ error: 'Failed to load markdown solution' });
  }
});

app.get('/sd/solutions/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    if (!/^problem-breakdowns-[a-z0-9-]+$/.test(slug)) {
      return res.status(400).send('Invalid solution slug');
    }

    const filePath = path.join(SD_SOLUTIONS_DIR, `${slug}.md`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Solution not found');
    }

    const rawMarkdown = fs.readFileSync(filePath, 'utf8');
    const title = toTitleCaseFromSlug(slug.replace('problem-breakdowns-', ''));
    const escaped = escapeHtml(rawMarkdown);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)} - Full Solution</title>
    <style>
      body { margin: 0; background: #0b1020; color: #e6ecff; font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
      .wrap { max-width: 1100px; margin: 0 auto; padding: 24px; }
      h1 { margin: 0 0 12px; font-size: 1.5rem; }
      .hint { color: #9fb0d9; margin-bottom: 16px; }
      pre { white-space: pre-wrap; word-break: break-word; background: #121a33; border: 1px solid #2a365f; border-radius: 12px; padding: 16px; line-height: 1.45; overflow: auto; }
      a { color: #8fb4ff; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <h1>${escapeHtml(title)} - Full System Design Solution</h1>
      <div class="hint">Source: ${escapeHtml(slug)}.md</div>
      <pre>${escaped}</pre>
      <p><a href="/">Back to app</a></p>
    </div>
  </body>
</html>`);
  } catch (error) {
    console.error('Failed to render solution page:', error);
    return res.status(500).send('Failed to load solution page');
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Health check endpoint for Cloud Run
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start log streamer
LogStreamer.start();

const PORT = process.env.PORT || 3005;
const HOST = '0.0.0.0';

// Initialize database and start server
const startServer = async () => {
  try {
    // Import database after requiring models
    const sequelize = require('./src/models/db');

    // Test database connection
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Sync all models
    console.log('Syncing database models...');
    try {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synced');
    } catch (syncError) {
      console.warn('⚠️  Schema sync warning:', syncError.message);
      console.log('✅ Continuing with existing schema...');
      // Don't fail startup on schema issues - use what's there
    }

    // Seed test user
    try {
      const hashed = await bcrypt.hash('test123', 10);
      await User.findOrCreate({
        where: { email: 'test@mailnator.io' },
        defaults: { passwordHash: hashed }
      });
      console.log(`✅ Test user seeded/ready`);
    } catch (err) {
      console.error('Error seeding test user:', err);
    }

    // Start listening
    app.listen(PORT, HOST, () => {
      console.log(`Server running on http://${HOST}:${PORT}`);
      console.log(`📊 Log streaming available at /api/logs/stream`);
      console.log(`🏥 Health check available at /health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

