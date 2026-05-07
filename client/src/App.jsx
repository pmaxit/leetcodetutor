import React, { useState, useEffect, useRef } from 'react';
import { Tldraw } from 'tldraw';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'tldraw/tldraw.css';
import 'katex/dist/katex.min.css';
import './index.css';
import SystemDesignView from './SystemDesignView';
import DebugBar from './DebugBar';
import { formatProblemDescription } from './utils/formatProblemDescription';
import { formatLeetcodeHTML } from './utils/formatLeetcodeHTML';
import Login from './components/Login';
import SettingsPage from './components/SettingsPage';
import StatsPage from './components/StatsPage';

const API = import.meta.env.PROD ? '' : 'http://127.0.0.1:3005';

// Component to access tldraw editor instance
const TldrawWrapper = ({ onEditorMount }) => {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Tldraw onMount={onEditorMount} inferDarkMode />
    </div>
  );
};

function App() {
  // ─── Mode: 'dsa' | 'system-design' | 'practice' ─────────────────────────────
  const [mode, setMode] = useState('dsa');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('main'); // 'main' | 'settings' | 'stats'

  // ─── DSA State ───────────────────────────────────────────────────────────────
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [currentTab, setCurrentTab] = useState('code');
  const [codeValue, setCodeValue] = useState('# Select a problem to start');
  const [codeFeedback, setCodeFeedback] = useState([]);
  const [report, setReport] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [problemPaneWidth, setProblemPaneWidth] = useState(45);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [constraints, setConstraints] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({ 'Arrays & Hashing': true });
  const [dsaExpanded, setDsaExpanded] = useState(true);
  const chatEndRef = useRef(null);
  const tldrawEditor = useRef(null);
  const saveTimeoutRef = useRef(null);
  const [isDraggingDivider, setIsDraggingDivider] = useState(false);
  const [feedbackPaneWidth, setFeedbackPaneWidth] = useState(350);
  const [isDraggingFeedbackDivider, setIsDraggingFeedbackDivider] = useState(false);

  // ─── System Design State ─────────────────────────────────────────────────────
  const [sdQuestions, setSdQuestions] = useState([]);
  const [selectedSdQuestion, setSelectedSdQuestion] = useState(null);
  const [sdExpanded, setSdExpanded] = useState(true);
  const [status, setStatus] = useState({ text: 'Ready', type: 'info' });
  const [llmHealth, setLlmHealth] = useState({ status: 'unknown', message: 'Checking...' });
  const [activeModel, setActiveModel] = useState('Gemma 4 (Primary)');

  // ─── Practice State ──────────────────────────────────────────────────────────
  const [practiceConfig, setPracticeConfig] = useState({ newPerDay: 2, pastPerDay: 3 });
  const [practiceSchedule, setPracticeSchedule] = useState(null);
  const [practiceSessionName, setPracticeSessionName] = useState(null);
  const [practiceSessionId, setPracticeSessionId] = useState(null);
  const [practiceConfiguring, setPracticeConfiguring] = useState(true);
  const [selectedPracticeDay, setSelectedPracticeDay] = useState(null);
  const [practiceProgress, setPracticeProgress] = useState({});
  const [expandedSessions, setExpandedSessions] = useState({});
  const [expandedPracticeDays, setExpandedPracticeDays] = useState({});
  const [savedPracticeSessions, setSavedPracticeSessions] = useState([]);
  const [showLoadSession, setShowLoadSession] = useState(false);
  const [renamingSessionId, setRenamingSessionId] = useState(null);
  const [renamingSessionName, setRenamingSessionName] = useState('');
  const [questionStatuses, setQuestionStatuses] = useState({});
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });
  const [isChatOpen, setIsChatOpen] = useState(false);

  // ─── Auth State ─────────────────────────────────────────────────────────────
  const [token, setToken] = useState(localStorage.getItem('ag_token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('ag_user')));

  const handleLogin = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('ag_token', newToken);
    localStorage.setItem('ag_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ag_token');
    localStorage.removeItem('ag_user');
  };

  const fetchWithAuth = (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    });
  };

  const checkLLMHealth = async () => {
    setLlmHealth({ status: 'checking', message: 'Checking LM Studio...' });
    try {
      const res = await fetch(`${API}/api/health`);
      const data = await res.json();
      if (res.ok) {
        setLlmHealth({ status: 'connected', message: 'LM Studio Connected ✓' });
      } else {
        setLlmHealth({ status: 'disconnected', message: 'LM Studio Disconnected ✗' });
      }
    } catch (error) {
      console.error('Health check failed:', error);
      setLlmHealth({ status: 'disconnected', message: 'LM Studio not responding' });
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDividerMouseDown = () => {
    setIsDraggingDivider(true);
  };

  const handleFeedbackDividerMouseDown = () => {
    setIsDraggingFeedbackDivider(true);
  };

  useEffect(() => {
    if (!isDraggingDivider && !isDraggingFeedbackDivider) return;

    const handleMouseMove = (e) => {
      const workspace = document.querySelector('.split-view');
      if (!workspace) return;
      const rect = workspace.getBoundingClientRect();

      if (isDraggingDivider) {
        const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
        if (newWidth > 20 && newWidth < 80) {
          setProblemPaneWidth(newWidth);
        }
      } else if (isDraggingFeedbackDivider) {
        const newWidth = rect.right - e.clientX;
        if (newWidth > 250 && newWidth < 600) {
          setFeedbackPaneWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingDivider(false);
      setIsDraggingFeedbackDivider(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingDivider, isDraggingFeedbackDivider]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!token) return;

    const init = async () => {
      try {
        const qRes = await fetchWithAuth(`${API}/api/questions`);
        const qData = await qRes.json();
        setQuestions(qData);

        const sdRes = await fetchWithAuth(`${API}/api/sd/questions`);
        const sdData = await sdRes.json();
        setSdQuestions(sdData);

        // Load saved practice sessions
        const psRes = await fetchWithAuth(`${API}/api/practice/sessions`);
        const psData = await psRes.json();
        setSavedPracticeSessions(psData);

        // Auto-load the most recent practice session if it exists
        if (psData.length > 0) {
          const mostRecent = psData[0]; // Already sorted by createdAt DESC
          const sessionRes = await fetchWithAuth(`${API}/api/practice/session/${mostRecent.id}`);
          const sessionData = await sessionRes.json();

          setPracticeSchedule(sessionData.schedule);
          setPracticeSessionName(sessionData.sessionName);
          setPracticeSessionId(sessionData.id);
          setPracticeProgress(sessionData.progress || {});
          setPracticeConfig({
            newPerDay: sessionData.newPerDay,
            pastPerDay: sessionData.pastPerDay
          });
          setPracticeConfiguring(false);
        }

        const sRes = await fetchWithAuth(`${API}/api/session/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'DSA' }),
        });
        const sData = await sRes.json();
        setSession(sData.state);

        // Load question statuses
        const statusRes = await fetchWithAuth(`${API}/api/question-status`);
        const statusData = await statusRes.json();
        setQuestionStatuses(statusData);

        setMessages([
          {
            role: 'ai',
            content:
              "Welcome! Select a DSA problem or a System Design question from the tree to begin. I'll be tracking our requirements and constraints as we go.",
          },
        ]);
      } catch (error) {
        console.error('Failed to init:', error);
      }
    };
    init();
  }, [token]);

  const handleSelectQuestion = async (q) => {
    setSelectedQuestion(q);
    const boilerplate = q.practice_scaffold || q.boilerplate;
    const savedCode = questionStatuses[q.id]?.user_code;
    setCodeValue(savedCode || boilerplate);
    setCurrentTab('code');
    setCodeFeedback([]);
    setConstraints([]);

    // Sync boilerplate to backend immediately
    fetchWithAuth(`${API}/api/code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: boilerplate,
        selectedQuestion: q,
      }),
    });

    // If we have the pre-computed probe, show it immediately for zero latency
    if (q.initial_probe) {
      setMessages([{ role: 'ai', content: q.initial_probe }]);
      // Still ping backend to set up the session state for this question
      fetchWithAuth(`${API}/api/interviewer/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      return;
    }

    setMessages([{ role: 'ai', content: `Focusing on **${q.title}**. Fetching initial probe...` }]);
    try {
      const res = await fetchWithAuth(`${API}/api/interviewer/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setMessages([{ role: 'ai', content: data.probe }]);
    } catch (err) {
      console.error(err);
    }

  };
  const handleSelectSdQuestion = (q) => {
    setSelectedSdQuestion(q);
    setMode('system-design');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInputValue('');
    setStatus({ text: 'Agent Thinking...', type: 'loading' });

    try {
      const response = await fetchWithAuth(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          selectedQuestion: selectedQuestion,
        }),
      });


      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep partial line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'status') {
                setStatus({ text: data.message, type: 'loading' });
                if (data.model) setActiveModel(data.model);
              } else if (data.type === 'result') {
                setMessages((prev) => [...prev, { role: 'ai', content: data.response }]);
                if (data.constraints) setConstraints(data.constraints);
                setSession(data.state);
                if (data.model) setActiveModel(data.model);
                setStatus({ text: 'Ready', type: 'info' });
              } else if (data.type === 'error') {
                console.error('🚨 AI Error:', data.message);
                console.error('Error Details:', data);
                setMessages((prev) => [...prev, {
                  role: 'ai',
                  content: `⚠️ **Error**: ${data.message}\n\n**Troubleshooting**:\n- Is LM Studio running on localhost:1234?\n- Check the server logs for detailed error information.`
                }]);
                setStatus({ text: `Error: ${data.message}`, type: 'error' });
              }
            } catch (err) {
              console.error('Failed to parse SSE line:', line, err);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setStatus({ text: 'Connection Error', type: 'error' });
    }
  };

  const handleCodeChange = (value) => {
    setCodeValue(value);

    // Update local state immediately for snappy UI
    if (selectedQuestion) {
      setQuestionStatuses(prev => ({
        ...prev,
        [selectedQuestion.id]: {
          ...(prev[selectedQuestion.id] || {}),
          user_code: value
        }
      }));
    }

    // Debounce backend save
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      fetchWithAuth(`${API}/api/code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: value,
          selectedQuestion: selectedQuestion,
        }),
      });
    }, 1000); // Save after 1 second of inactivity
  };

  const handleResetCode = async () => {
    if (!selectedQuestion) return;
    if (window.confirm("Are you sure you want to reset to the boilerplate? Your current code will be lost.")) {
      const boilerplate = selectedQuestion.practice_scaffold || selectedQuestion.boilerplate;
      setCodeValue(boilerplate);

      // Update local state
      setQuestionStatuses(prev => ({
        ...prev,
        [selectedQuestion.id]: {
          ...(prev[selectedQuestion.id] || {}),
          user_code: null
        }
      }));

      try {
        await fetchWithAuth(`${API}/api/code/reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionId: selectedQuestion.id })
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleGetAiFeedback = async () => {
    setIsAiLoading(true);
    setStatus({ text: 'Initializing AI Engine...', type: 'loading' });
    try {
      let payload = {
        problem: selectedQuestion?.title,
        questionId: selectedQuestion?.id,
        type: currentTab,
      };

      if (currentTab === 'code') {
        setStatus({ text: 'Extracting source code...', type: 'loading' });
        payload.code = codeValue;
      } else {
        setStatus({ text: 'Capturing whiteboard shapes...', type: 'loading' });
        const shapes = tldrawEditor.current?.getCurrentPageShapes() || [];
        payload.whiteboard = shapes.map((s) => ({
          type: s.type,
          text: s.props?.text || '',
          x: s.x,
          y: s.y,
        }));
      }

      setStatus({ text: 'Consulting Principal Interviewer (Gemini)...', type: 'loading' });
      const response = await fetchWithAuth(`${API}/api/feedback/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setStatus({ text: 'Processing deep analysis results...', type: 'loading' });
      const data = await response.json();

      setCodeFeedback(data.feedback);
      setStatus({ text: 'Analysis complete. Insights updated.', type: 'success' });
      setTimeout(() => setStatus({ text: 'Ready', type: 'info' }), 5000);
    } catch (error) {
      console.error('AI Feedback error:', error);
      setStatus({ text: 'Analysis failed. Check network.', type: 'error' });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFinish = async () => {
    try {
      const response = await fetchWithAuth(`${API}/api/session/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: selectedQuestion?.id }),
      });
      const data = await response.json();

      setReport(data.report);
      setSession(data.state);
    } catch (error) {
      console.error('Finish error:', error);
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const generateRandomSessionName = () => {
    const adjectives = ['Swift', 'Sharp', 'Steady', 'Smart', 'Strong', 'Stellar', 'Sleek'];
    const nouns = ['Coder', 'Engineer', 'Developer', 'Scholar', 'Master', 'Expert', 'Pro'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 1000);
    return `${adj}${noun}${num}`;
  };

  const handleGeneratePracticeSchedule = async () => {
    setStatus({ text: 'Generating practice schedule...', type: 'loading' });
    try {
      const sessionName = generateRandomSessionName();
      const response = await fetchWithAuth(`${API}/api/practice/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPerDay: practiceConfig.newPerDay,
          pastPerDay: practiceConfig.pastPerDay,
          duration: 30,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.schedule) {
        throw new Error('Invalid response: missing schedule data');
      }

      // Save to database (convert schedule to ID-only format for smaller payload)
      setStatus({ text: 'Saving session to database...', type: 'loading' });
      const idOnlySchedule = {};
      Object.entries(data.schedule).forEach(([day, questions]) => {
        idOnlySchedule[day] = questions.map(q => q.id);
      });

      const saveRes = await fetchWithAuth(`${API}/api/practice/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionName,
          schedule: idOnlySchedule,
          newPerDay: practiceConfig.newPerDay,
          pastPerDay: practiceConfig.pastPerDay,
        }),
      });

      if (!saveRes.ok) {
        const errorData = await saveRes.json();
        throw new Error(errorData.error || `Save error: ${saveRes.status}`);
      }

      const savedSession = await saveRes.json();


      setPracticeSchedule(data.schedule);
      setPracticeSessionName(sessionName);
      setPracticeSessionId(savedSession.session.id);
      setPracticeProgress(data.progress || {});
      setPracticeConfiguring(false);
      setMode('dsa');

      // Auto-navigate and expand
      setCurrentView('main');
      setDsaExpanded(false);
      setSdExpanded(false);
      setExpandedSessions({ [savedSession.session.id]: true });

      setStatus({ text: 'Practice schedule ready!', type: 'success' });

      // Clear local user codes
      setQuestionStatuses(prev => {
        const next = {};
        for (const [id, val] of Object.entries(prev)) {
          next[id] = { ...(val || {}), user_code: null };
        }
        return next;
      });
      if (selectedQuestion) {
        setCodeValue(selectedQuestion.practice_scaffold || selectedQuestion.boilerplate);
      }

      // Refresh saved sessions list
      const sessionsRes = await fetchWithAuth(`${API}/api/practice/sessions`);
      const sessionsData = await sessionsRes.json();
      setSavedPracticeSessions(sessionsData);
    } catch (error) {
      console.error('Generate schedule error:', error);
      setStatus({ text: 'Failed to generate schedule', type: 'error' });
    }
  };

  const handleLoadPracticeSession = async (sessionId) => {
    try {
      setStatus({ text: 'Loading practice session...', type: 'loading' });
      const res = await fetchWithAuth(`${API}/api/practice/session/${sessionId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Load error: ${res.status}`);
      }
      const session = await res.json();


      setPracticeSchedule(session.schedule);
      setPracticeSessionName(session.sessionName);
      setPracticeSessionId(session.id);
      setPracticeProgress(session.progress || {});
      setPracticeConfig({ newPerDay: session.newPerDay, pastPerDay: session.pastPerDay });
      setPracticeConfiguring(false);
      setMode('dsa');
      setShowLoadSession(false);

      // Auto-navigate and expand
      setCurrentView('main');
      setDsaExpanded(false);
      setSdExpanded(false);
      setExpandedSessions({ [session.id]: true });

      setStatus({ text: 'Session loaded!', type: 'success' });
    } catch (error) {
      console.error('Load practice session error:', error);
      setStatus({ text: 'Failed to load session', type: 'error' });
    }
  };

  const handleRenameSession = async (sessionId, oldName) => {
    if (renamingSessionId === sessionId) {
      // Save rename
      if (renamingSessionName.trim() === '') {
        setRenamingSessionName(oldName);
        setRenamingSessionId(null);
        return;
      }

      try {
        const res = await fetchWithAuth(`${API}/api/practice/session/${sessionId}/rename`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newName: renamingSessionName }),
        });
        const data = await res.json();

        // Update local state if this is the active session
        if (practiceSessionId === sessionId) {
          setPracticeSessionName(renamingSessionName);
        }

        // Refresh sessions list
        const sessionsRes = await fetchWithAuth(`${API}/api/practice/sessions`);
        const sessionsData = await sessionsRes.json();
        setSavedPracticeSessions(sessionsData);


        setRenamingSessionId(null);
        setRenamingSessionName('');
        setStatus({ text: 'Session renamed!', type: 'success' });
      } catch (error) {
        console.error('Rename session error:', error);
        setStatus({ text: 'Failed to rename session', type: 'error' });
        setRenamingSessionName(oldName);
      }
    } else {
      // Start rename
      setRenamingSessionId(sessionId);
      setRenamingSessionName(oldName);
    }
  };

  const showConfirm = (title, message, onConfirm) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleDeleteSession = (sessionId) => {
    showConfirm(
      'Delete Session',
      'Are you sure you want to delete this practice session? This action cannot be undone.',
      async () => {
        try {
          setStatus({ text: 'Deleting session...', type: 'loading' });
          const response = await fetchWithAuth(`${API}/api/practice/session/${sessionId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Delete error: ${response.status}`);
          }

          // If deleting the active session, clear it
          if (practiceSessionId === sessionId) {
            setPracticeConfiguring(true);
            setSelectedPracticeDay(null);
            setPracticeProgress({});
            setPracticeSchedule(null);
            setPracticeSessionName(null);
            setPracticeSessionId(null);
          }

          setExpandedSessions(prev => {
            const next = { ...prev };
            delete next[sessionId];
            return next;
          });

          // Refresh sessions list
          const sessionsRes = await fetchWithAuth(`${API}/api/practice/sessions`);
          const sessionsData = await sessionsRes.json();
          setSavedPracticeSessions(sessionsData);

          setStatus({ text: 'Session deleted', type: 'success' });
        } catch (error) {
          console.error('Delete session error:', error);
          setStatus({ text: 'Failed to delete session', type: 'error' });
        }
      }
    );
  };

const handleResetPracticeSession = async () => {
  if (window.confirm('Reset this practice session? It will be deleted from the database.')) {
    try {
      setStatus({ text: 'Deleting session...', type: 'loading' });
      if (practiceSessionId) {
        await fetchWithAuth(`${API}/api/practice/session/${practiceSessionId}`, {
          method: 'DELETE',
        });
      }


      setPracticeConfiguring(true);
      setSelectedPracticeDay(null);
      setPracticeProgress({});
      setPracticeSchedule(null);
      setPracticeSessionName(null);
      setPracticeSessionId(null);
      setStatus({ text: 'Session reset', type: 'success' });

      // Clear local user codes
      setQuestionStatuses(prev => {
        const next = {};
        for (const [id, val] of Object.entries(prev)) {
          next[id] = { ...(val || {}), user_code: null };
        }
        return next;
      });
      if (selectedQuestion) {
        setCodeValue(selectedQuestion.practice_scaffold || selectedQuestion.boilerplate);
      }

      // Refresh saved sessions list
      const sessionsRes = await fetchWithAuth(`${API}/api/practice/sessions`);
      const sessionsData = await sessionsRes.json();
      setSavedPracticeSessions(sessionsData);

    } catch (error) {
      console.error('Reset practice session error:', error);
      setStatus({ text: 'Failed to reset session', type: 'error' });
    }
  }
};

const handleMarkQuestionDone = async (questionId) => {
  const newProgress = {
    ...practiceProgress,
    [questionId]: !(practiceProgress[questionId] || false),
  };
  setPracticeProgress(newProgress);

  // Save progress to database
  if (practiceSessionId) {
    try {
      await fetchWithAuth(`${API}/api/practice/session/${practiceSessionId}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: newProgress }),
      });
    } catch (error) {
      console.error('Update progress error:', error);
    }
  }

};

const handleSetQuestionStatus = async (questionId, status) => {
  const newStatuses = {
    ...questionStatuses,
    [questionId]: { ...(questionStatuses[questionId] || {}), status },
  };
  setQuestionStatuses(newStatuses);

  try {
    await fetchWithAuth(`${API}/api/question-status/${questionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    console.error('Update question status error:', error);
  }

};

const renderProblemDescription = () => {
  if (!selectedQuestion) {
    return <p className="placeholder-text">Select a problem to begin.</p>;
  }

  // Get navigation context
  let nav = null;
  if (practiceSchedule && selectedPracticeDay) {
    const dayQuestions = practiceSchedule[selectedPracticeDay];
    const currentIndex = dayQuestions.findIndex(q => q.id === selectedQuestion.id);
    if (currentIndex !== -1) {
      const days = Object.keys(practiceSchedule).sort((a, b) => {
        const d1 = parseInt(a.split(' ')[1]);
        const d2 = parseInt(b.split(' ')[1]);
        return d1 - d2;
      });
      const currentDayIndex = days.indexOf(selectedPracticeDay);
      
      nav = {
        prev: currentIndex > 0 ? dayQuestions[currentIndex - 1] : null,
        next: currentIndex < dayQuestions.length - 1 ? dayQuestions[currentIndex + 1] : null,
        nextDay: (currentIndex === dayQuestions.length - 1 && currentDayIndex < days.length - 1) ? days[currentDayIndex + 1] : null,
        index: currentIndex,
        total: dayQuestions.length
      };
    }
  }

  const handleNavigate = (q, day = null) => {
    if (day) {
      setSelectedPracticeDay(day);
      const firstInDay = practiceSchedule[day][0];
      handleSelectQuestion(firstInDay);
    } else if (q) {
      handleSelectQuestion(q);
    }
  };

  const description = selectedQuestion.description || selectedQuestion.statement || '';
  const isHTML = /<[a-z][\s\S]*>/i.test(description);

  return (
    <div className="problem-content-wrapper">
      {/* Navigation Card */}
      {nav && (
        <div className="problem-nav-card">
          <button 
            className={`nav-btn prev ${!nav.prev ? 'disabled' : ''}`}
            onClick={() => nav.prev && handleNavigate(nav.prev)}
            disabled={!nav.prev}
          >
            <span className="nav-arrow">←</span>
            <span className="nav-text">{nav.prev ? nav.prev.title : 'First Problem'}</span>
          </button>
          
          <div className="nav-info">
            <span className="nav-day">{selectedPracticeDay}</span>
            <span className="nav-progress">{nav.index + 1} / {nav.total}</span>
          </div>

          {nav.next ? (
            <button className="nav-btn next" onClick={() => handleNavigate(nav.next)}>
              <span className="nav-text">{nav.next.title}</span>
              <span className="nav-arrow">→</span>
            </button>
          ) : nav.nextDay ? (
            <button className="nav-btn next-day" onClick={() => handleNavigate(null, nav.nextDay)}>
              <span className="nav-text">Next Day</span>
              <span className="nav-arrow">→</span>
            </button>
          ) : (
            <button className="nav-btn next disabled" disabled>
              <span className="nav-text">Last Problem</span>
              <span className="nav-arrow">→</span>
            </button>
          )}
        </div>
      )}

      <h1 className="problem-title">{selectedQuestion.title}</h1>

      <div className="problem-statement-html">
        {isHTML ? (
          <div dangerouslySetInnerHTML={{ __html: formatLeetcodeHTML(description) }} />
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ node, ...props }) => <p style={{ marginBottom: '1rem', lineHeight: '1.6' }} {...props} />,
              strong: ({ node, ...props }) => <strong style={{ color: 'var(--accent)', fontWeight: 600 }} {...props} />,
            }}
          >
            {formatProblemDescription(description)}
          </ReactMarkdown>
        )}
      </div>

      {(selectedQuestion.neetcode_url || selectedQuestion.leetcode_url || selectedQuestion.youtube_url) && (
        <div className="problem-resources">
          <div className="panel-header sub-header" style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Resources</div>
          <div className="resource-links">
            {selectedQuestion.neetcode_url && (
              <a href={selectedQuestion.neetcode_url} target="_blank" rel="noreferrer" className="resource-link neetcode">
                <span className="icon">🚀</span> NeetCode Solution
              </a>
            )}
            {selectedQuestion.leetcode_url && (
              <a href={selectedQuestion.leetcode_url} target="_blank" rel="noreferrer" className="resource-link leetcode">
                <span className="icon">📝</span> LeetCode Problem
              </a>
            )}
          </div>

          {selectedQuestion.youtube_url && (
            <div className="video-embed-container" style={{ marginTop: '1rem' }}>
              <iframe
                width="100%"
                height="315"
                src={`https://www.youtube.com/embed/${selectedQuestion.youtube_url.split('v=')[1]?.split('&')[0] || selectedQuestion.youtube_url.split('/').pop()}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ borderRadius: '8px', border: '1px solid var(--border)' }}
              ></iframe>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


// Group DSA questions by category
const groupedQuestions = questions.reduce((acc, q) => {
  const cat = q.category || 'General';
  if (!acc[cat]) acc[cat] = [];
  acc[cat].push(q);
  return acc;
}, {});

if (!token) {
  return <Login onLogin={handleLogin} />;
}

return (
  <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : ''} ${currentView === 'main' ? '' : currentView + '-view'}`} style={{
    gridTemplateColumns: currentView === 'main' ? '280px 1fr' : '1fr'
  }}>

    {/* Mobile Sidebar Overlay */}
    {currentView === 'main' && isSidebarOpen && (
      <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
    )}
    <header>
      <div className="header-left">
        {currentView === 'main' && (
          <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Toggle Sidebar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
      <div className="header-center">
        {currentView === 'main' && (
          <div className="mode-switcher">
            <button
              className={`mode-tab ${mode === 'dsa' ? 'active' : ''}`}
              onClick={() => setMode('dsa')}
            >
              <span className="mode-icon">&lt;/&gt;</span> Algorithms
            </button>
            <button
              className={`mode-tab ${mode === 'system-design' ? 'active' : ''}`}
              onClick={() => setMode('system-design')}
            >
              <span className="mode-icon">⬡</span> System Design
            </button>
          </div>
        )}
      </div>
      <div className="header-right">
        <div className="user-info">
          <span className="user-email">{user?.email}</span>
        </div>
        {currentView === 'main' && (
          <>
            <button onClick={() => setCurrentView('stats')} className="header-icon-btn" title="Statistics">📊</button>
            <button onClick={() => setCurrentView('settings')} className="header-icon-btn" title="Settings">⚙️</button>
          </>
        )}
        <button onClick={handleLogout} className="header-icon-btn logout-btn" title="Logout">🚪</button>
      </div>
    </header>


    {/* ─── SIDEBAR (always visible on desktop, toggleable on mobile) ────────────────────────────── */}
    {currentView === 'main' && (
      <aside className={`panel sidebar-panel ${isSidebarOpen ? 'open' : ''}`}>
        <div className="logo sidebar-logo">
          <span className="logo-mark">AG</span>
          Antigravity
          <span className="logo-sub">Interview</span>
        </div>
        <div className="panel-header">Curriculum</div>
        <div className="tree-navigation">
          {/* DSA Section - Collapsible Header */}
          <div className="tree-group">
            <div
              className={`tree-header tree-main-header ${dsaExpanded ? 'expanded' : ''}`}
              onClick={() => setDsaExpanded(!dsaExpanded)}
            >
              <span className="chevron"></span>
              <span>⚙</span> DSA Problems
            </div>
            {dsaExpanded && (
              <div className="tree-content">
                {Object.entries(groupedQuestions).map(([category, qs]) => (
                  <div key={category} className="tree-group">
                    <div
                      className={`tree-header ${expandedCategories[category] ? 'expanded' : ''}`}
                      onClick={() => toggleCategory(category)}
                    >
                      <span className="chevron"></span>
                      {category}
                    </div>
                    {expandedCategories[category] && (
                      <div className="tree-content">
                        {qs.map((q) => (
                          <div
                            key={q.id}
                            className={`tree-item ${mode === 'dsa' && selectedQuestion?.id === q.id ? 'active' : ''} ${questionStatuses[q.id]?.status || 'needs-review'}`}
                            onClick={() => { setMode('dsa'); handleSelectQuestion(q); }}
                          >
                            <span className={`status-dot status-dot--${questionStatuses[q.id]?.status || 'needs_review'}`} />
                            {q.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Design Section - Collapsible Header */}
          <div className="tree-group">
            <div
              className={`tree-header tree-main-header ${sdExpanded ? 'expanded' : ''}`}
              onClick={() => setSdExpanded(!sdExpanded)}
            >
              <span className="chevron"></span>
              <span>🏗</span> System Design
            </div>
            {sdExpanded && (
              <div className="tree-content">
                {sdQuestions.map((q) => (
                  <div
                    key={q.id}
                    className={`tree-item ${mode === 'system-design' && selectedSdQuestion?.id === q.id ? 'active' : ''}`}
                    onClick={() => handleSelectSdQuestion(q)}
                  >
                    {q.title}
                    <span className={`sd-tree-badge sd-tree-badge--${q.difficulty?.toLowerCase()}`}>
                      {q.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Sessions Section */}
          <div className="tree-group">
            <div className="tree-header tree-main-header">
              <span>📅</span> Active Sessions
            </div>
            <div className="tree-content" style={{ paddingLeft: 0 }}>
              {savedPracticeSessions.length === 0 ? (
                <div className="tree-item placeholder-text" style={{ paddingLeft: '1rem', border: 'none' }}>
                  No active sessions. Create one in Settings.
                </div>
              ) : (
                savedPracticeSessions.map((session) => {
                  const isExpanded = expandedSessions[session.id];
                  const isActive = practiceSessionId === session.id;

                  return (
                    <div key={session.id} className="tree-group">
                      <div
                        className={`tree-header ${isExpanded ? 'expanded' : ''} ${isActive ? 'active-session-header' : ''}`}
                        onClick={() => {
                          setExpandedSessions(prev => ({ ...prev, [session.id]: !isExpanded }));
                          if (!isActive) handleLoadPracticeSession(session.id);
                        }}
                      >
                        <span className="chevron"></span>
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {session.sessionName}
                        </span>
                        <button
                          className="practice-delete-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(session.id);
                          }}
                          title="Delete session"
                        >
                          🗑
                        </button>
                      </div>

                      {isExpanded && isActive && practiceSchedule && (
                        <div className="tree-content">
                          {Object.entries(practiceSchedule).map(([day, dayQuestions]) => {
                            const dayNum = parseInt(day);
                            const dayExpanded = expandedPracticeDays[day];
                            const completed = dayQuestions.every(q => practiceProgress[q.id]);

                            return (
                              <div key={day} className="practice-day-group">
                                <div
                                  className={`practice-day-header-small ${dayExpanded ? 'expanded' : ''} ${completed ? 'completed' : ''}`}
                                  onClick={() => setExpandedPracticeDays(prev => ({
                                    ...prev,
                                    [day]: !prev[day]
                                  }))}
                                >
                                  <span className="chevron"></span>
                                  <span className="day-label">Day {dayNum}</span>
                                  <span className="day-count">{dayQuestions.length}</span>
                                  {completed && <span className="day-done">✓</span>}
                                </div>
                                {dayExpanded && (
                                  <div className="tree-content">
                                    {dayQuestions.map((q) => (
                                      <div
                                        key={q.id}
                                        className={`tree-item practice-question ${mode === 'dsa' && selectedQuestion?.id === q.id ? 'active' : ''} ${practiceProgress[q.id] ? 'done' : ''} ${questionStatuses[q.id]?.status || 'needs-review'}`}
                                        onClick={() => { setMode('dsa'); handleSelectQuestion(q); }}
                                      >
                                        <span className={`status-dot status-dot--${questionStatuses[q.id]?.status || 'needs_review'}`} />
                                        {practiceProgress[q.id] && <span className="done-check">✓</span>}
                                        {q.title}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </aside>
    )}

    {/* ─── PAGE VIEWS ────────────────────────────────────────────── */}
    {currentView === 'settings' && (
      <SettingsPage
        practiceConfig={practiceConfig}
        setPracticeConfig={setPracticeConfig}
        savedPracticeSessions={savedPracticeSessions}
        onGenerateSchedule={handleGeneratePracticeSchedule}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onBack={() => setCurrentView('main')}
        renamingSessionId={renamingSessionId}
        renamingSessionName={renamingSessionName}
        setRenamingSessionId={setRenamingSessionId}
        setRenamingSessionName={setRenamingSessionName}
        practiceSessionId={practiceSessionId}
      />
    )}

    {currentView === 'stats' && (
      <StatsPage
        questions={questions}
        savedPracticeSessions={savedPracticeSessions}
        questionStatuses={questionStatuses}
        onBack={() => setCurrentView('main')}
      />
    )}

    {/* ─── MAIN WORKSPACE ─────────────────────────────────────── */}
    {currentView === 'main' && (mode === 'system-design' ? (
      <div className="sd-workspace">
        <SystemDesignView question={selectedSdQuestion} />
      </div>
    ) : (
      <main className="workspace split-view">
        {/* Left: Code and Problem Area */}
        <div className="workspace-content-container">
          {/* Top Section: Problem Description (Always Visible) */}
          <section className="problem-pane" style={{ 
            width: `var(--problem-pane-width, ${problemPaneWidth}%)`, 
            minWidth: 0, 
            overflow: 'auto' 
          }}>
            <div className="workspace-header">
              <div className="panel-header" style={{ background: 'transparent', padding: '0' }}></div>
              {selectedQuestion && (
                <button
                  className={`status-toggle-btn ${questionStatuses[selectedQuestion.id]?.status === 'done' ? 'done' : 'needs-review'}`}
                  onClick={() => handleSetQuestionStatus(selectedQuestion.id,
                    questionStatuses[selectedQuestion.id]?.status === 'done' ? 'needs_review' : 'done'
                  )}
                >
                  {questionStatuses[selectedQuestion.id]?.status === 'done' ? '✓ Done' : '○ Needs Review'}
                </button>
              )}
            </div>
            <div className="problem-description-view">
              {renderProblemDescription()}
            </div>
          </section>

          {/* Draggable Divider (Hide on mobile via CSS) */}
          <div
            className="resize-divider desktop-only"
            onMouseDown={handleDividerMouseDown}
            style={{ cursor: isDraggingDivider ? 'col-resize' : 'default' }}
          />

          {/* Bottom Section: Interactive Area (Tabs) */}
          <section className="action-pane">
            <div className="workspace-header">
              <div className="tabs">
                <div
                  className={`tab ${currentTab === 'code' ? 'active' : ''}`}
                  onClick={() => setCurrentTab('code')}
                >
                  Code Editor
                </div>
                <div
                  className={`tab ${currentTab === 'whiteboard' ? 'active' : ''}`}
                  onClick={() => setCurrentTab('whiteboard')}
                >
                  Whiteboard
                </div>
                <div
                  className={`tab ${currentTab === 'solution' ? 'active' : ''}`}
                  onClick={() => setCurrentTab('solution')}
                >
                  Reference Solution
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleResetCode}
                  disabled={currentTab !== 'code'}
                  className="action-btn-secondary"
                >
                  Reset Code
                </button>
                <button
                  onClick={handleGetAiFeedback}
                  disabled={isAiLoading}
                  className="ai-feedback-btn"
                >
                  {isAiLoading ? 'Analyzing...' : 'Get AI Feedback'}
                </button>
              </div>
            </div>

            <div className="canvas-area">
              {currentTab === 'whiteboard' ? (
                <TldrawWrapper
                  onEditorMount={(editor) => {
                    tldrawEditor.current = editor;
                  }}
                />
              ) : currentTab === 'solution' ? (
                <div style={{ height: '100%' }}>
                  <Editor
                    key={`solution-${selectedQuestion?.id || 'default'}`}
                    height="100%"
                    defaultLanguage="python"
                    theme="vs-dark"
                    value={selectedQuestion?.python_code || '# No reference solution available'}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>
              ) : (
                <div style={{ height: '100%' }}>
                  <Editor
                    key={selectedQuestion?.id || 'default'}
                    height="100%"
                    defaultLanguage="python"
                    theme="vs-dark"
                    value={codeValue}
                    onChange={handleCodeChange}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Draggable Divider for Feedback Panel */}
        <div
          className="resize-divider desktop-only"
          onMouseDown={handleFeedbackDividerMouseDown}
          style={{ cursor: isDraggingFeedbackDivider ? 'col-resize' : 'default', borderLeft: '1px solid var(--border)' }}
        />

        {/* ─── INTERVIEWER PANEL ─────────────────────────────────────── */}
        <aside className={`panel feedback-panel ${isChatOpen ? 'open' : ''}`} style={{ minWidth: 0, width: `${feedbackPaneWidth}px` }}>
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Interviewer</span>
            <button className="mobile-only chat-close-btn" onClick={() => setIsChatOpen(false)}>×</button>
          </div>
          <div className="chat-container">
            {constraints.length > 0 && (
              <>
                <div className="panel-header sub-header">Active Constraints</div>
                <div className="constraints-list">
                  {constraints.map((c, i) => (
                    <div key={i} className="constraint-tag">
                      {c}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="messages-list">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role}`}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                  {msg.role === 'user' && (
                    <button
                      className="message-repeat-btn"
                      onClick={() => {
                        setInputValue(msg.content);
                        document.querySelector('.chat-input-area input')?.focus();
                      }}
                      title="Repeat this message"
                    >
                      🔁
                    </button>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <div className="input-wrapper">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Gather requirements..."
                  autoComplete="off"
                  spellCheck="false"
                />
                <button className="send-btn" type="submit">
                  Send
                </button>
              </div>
            </form>
          </div>

          <div className="panel-header" style={{ borderTop: '1px solid var(--border)' }}>AI Insights</div>
          <div style={{ padding: '1rem', fontSize: '0.85rem' }}>
            <div className="feedback-container">
              {codeFeedback.length > 0 ? (
                codeFeedback.map((f, i) => (
                  <div key={i} className={`feedback-item ${f.type}`}>
                    <strong>{f.type.toUpperCase()}:</strong> {f.message}
                  </div>
                ))
              ) : (
                <p className="placeholder-text">Click 'Get AI Feedback' for deep analysis.</p>
              )}
            </div>
          </div>
        </aside>
      </main>
    ))}

    {/* Floating Chat Button (Mobile Only) */}
    {currentView === 'main' && (
      <button 
        className={`floating-chat-btn mobile-only ${isChatOpen ? 'hidden' : ''}`}
        onClick={() => setIsChatOpen(true)}
        aria-label="Open Interviewer"
      >
        <span className="chat-icon">💬</span>
      </button>
    )}

    {/* Mobile Chat Overlay */}
    {currentView === 'main' && isChatOpen && (
      <div className="mobile-overlay" onClick={() => setIsChatOpen(false)}></div>
    )}

    {currentView === 'main' && report && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2 className="accent-text">Performance Report</h2>
          <div className="report-grid">
            {Object.entries(report.rubric).map(([k, v]) => (
              <div key={k} className="report-card">
                <div className="card-label">{k}</div>
                <div className="card-value">{v}%</div>
              </div>
            ))}
          </div>
          <p className="report-critique">{report.critique}</p>
          <button onClick={() => setReport(null)} className="send-btn">
            Close
          </button>
        </div>
      </div>
    )}

    {currentView === 'main' && (
      <footer className={`status-bar status--${status.type}`}>
        <div className="status-indicator">
          {status.type === 'loading' && <div className="pulse-dot" />}
          {status.type === 'success' && <span className="status-icon">✓</span>}
          {status.type === 'error' && <span className="status-icon">⚠</span>}
          <span className="status-text">{status.text}</span>
        </div>
        <div className="status-right">
          <button
            onClick={checkLLMHealth}
            style={{
              background: 'transparent',
              border: 'none',
              color: llmHealth.status === 'connected' ? '#4ade80' : llmHealth.status === 'disconnected' ? '#ef4444' : '#a78bfa',
              cursor: 'pointer',
              fontSize: '0.85rem',
              padding: '0 8px',
              textDecoration: 'underline'
            }}
            title="Click to check LM Studio connection"
          >
            {llmHealth.message}
          </button>
          <span className="status-sep">|</span>
          <span className="status-model">{activeModel}</span>
          <span className="status-sep">|</span>
          <span className="status-latency">Principal Agent Active</span>
        </div>
      </footer>
    )}

    {currentView === 'main' && <DebugBar />}

    {confirmModal.isOpen && (
      <ConfirmationModal
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    )}
  </div>
);
}

const ConfirmationModal = ({ title, message, onConfirm, onCancel }) => {
return (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal-container" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3 className="modal-title">{title}</h3>
        <button className="modal-close" onClick={onCancel}>×</button>
      </div>
      <div className="modal-body">
        <p className="modal-message">{message}</p>
      </div>
      <div className="modal-footer">
        <button className="modal-btn modal-btn--cancel" onClick={onCancel}>Cancel</button>
        <button className="modal-btn modal-btn--confirm" onClick={onConfirm}>Confirm</button>
      </div>
    </div>
  </div>
);
};

export default App;
