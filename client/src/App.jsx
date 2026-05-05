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

const API = 'http://127.0.0.1:3005';

// Component to access tldraw editor instance
const TldrawWrapper = ({ onEditorMount }) => {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Tldraw onMount={onEditorMount} inferDarkMode />
    </div>
  );
};

function App() {
  // ─── Mode: 'dsa' | 'system-design' ─────────────────────────────────────────
  const [mode, setMode] = useState('dsa');

  // ─── DSA State ───────────────────────────────────────────────────────────────
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [currentTab, setCurrentTab] = useState('code');
  const [codeValue, setCodeValue] = useState('# Select a problem to start');
  const [codeFeedback, setCodeFeedback] = useState([]);
  const [report, setReport] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [constraints, setConstraints] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const chatEndRef = useRef(null);
  const tldrawEditor = useRef(null);

  // ─── System Design State ─────────────────────────────────────────────────────
  const [sdQuestions, setSdQuestions] = useState([]);
  const [selectedSdQuestion, setSelectedSdQuestion] = useState(null);
  const [sdExpanded, setSdExpanded] = useState(true);
  const [status, setStatus] = useState({ text: 'Ready', type: 'info' });

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const init = async () => {
      try {
        const qRes = await fetch(`${API}/api/questions`);
        const qData = await qRes.json();
        setQuestions(qData);

        const sdRes = await fetch(`${API}/api/sd/questions`);
        const sdData = await sdRes.json();
        setSdQuestions(sdData);

        const sRes = await fetch(`${API}/api/session/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'DSA' }),
        });
        const sData = await sRes.json();
        setSession(sData.state);

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
  }, []);

  const handleSelectQuestion = async (q) => {
    setSelectedQuestion(q);
    const boilerplate = q.practice_scaffold || q.boilerplate;
    setCodeValue(boilerplate);
    setCurrentTab('code');
    setCodeFeedback([]);
    setConstraints([]);

    // Sync boilerplate to backend immediately
    fetch(`${API}/api/code`, {
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
      fetch(`${API}/api/interviewer/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      return;
    }

    setMessages([{ role: 'ai', content: `Focusing on **${q.title}**. Fetching initial probe...` }]);
    try {
      const res = await fetch(`${API}/api/interviewer/init`, {
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
      const response = await fetch(`${API}/api/chat`, {
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
              } else if (data.type === 'result') {
                setMessages((prev) => [...prev, { role: 'ai', content: data.response }]);
                if (data.constraints) setConstraints(data.constraints);
                setSession(data.state);
                setStatus({ text: 'Ready', type: 'info' });
              } else if (data.type === 'error') {
                console.error('AI Error:', data.message);
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
    fetch(`${API}/api/code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: value,
        selectedQuestion: selectedQuestion,
      }),
    });
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
      const response = await fetch(`${API}/api/feedback/ai`, {
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
      const response = await fetch(`${API}/api/session/finish`, {
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

  // Group DSA questions by category
  const groupedQuestions = questions.reduce((acc, q) => {
    const cat = q.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(q);
    return acc;
  }, {});

  return (
    <div className="app-container">
      <header>
        <div className="header-center">
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
        </div>
        <div className="header-right">
          <button onClick={handleFinish} className="finish-btn">
            End Session
          </button>
        </div>
      </header>

      {/* ─── SIDEBAR (always visible) ────────────────────────────── */}
      <aside className="panel sidebar-panel">
        <div className="logo sidebar-logo">
          <span className="logo-mark">AG</span>
          Antigravity
          <span className="logo-sub">Interview</span>
        </div>
        <div className="panel-header">Curriculum</div>
        <div className="tree-navigation">
          {/* DSA Section */}
          <div className="tree-section-label">
            <span>⚙</span> DSA Problems
          </div>
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
                      className={`tree-item ${mode === 'dsa' && selectedQuestion?.id === q.id ? 'active' : ''}`}
                      onClick={() => { setMode('dsa'); handleSelectQuestion(q); }}
                    >
                      {q.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* System Design Section */}
          <div className="tree-section-label" style={{ marginTop: '1rem' }}>
            <span>🏗</span> System Design
          </div>
          <div className="tree-group">
            <div
              className={`tree-header ${sdExpanded ? 'expanded' : ''}`}
              onClick={() => setSdExpanded(p => !p)}
            >
              <span className="chevron"></span>
              Infrastructure & Scale
            </div>
            {sdExpanded && (
              <div className="tree-content">
                {sdQuestions.map((q) => (
                  <div
                    key={q.id}
                    className={`tree-item ${mode === 'system-design' && selectedSdQuestion?.id === q.id ? 'active' : ''}`}
                    onClick={() => handleSelectSdQuestion(q)}
                  >
                    <span style={{ marginRight: '0.35rem' }}>🏗</span>
                    {q.title}
                    <span className={`sd-tree-badge sd-tree-badge--${q.difficulty?.toLowerCase()}`}>
                      {q.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </aside>

      {/* ─── MAIN WORKSPACE ─────────────────────────────────────── */}
      {mode === 'system-design' ? (
        <div className="sd-workspace" style={{ gridColumn: '2 / 4' }}>
          <SystemDesignView question={selectedSdQuestion} />
        </div>
      ) : (
        <>
          <main className="workspace split-view">
            {/* Top Section: Problem Description (Always Visible) */}
            <section className="problem-pane">
              <div className="workspace-header">
                <div className="panel-header" style={{ background: 'transparent', padding: '0' }}>Problem Description</div>
              </div>
              <div className="problem-description-view">
                {selectedQuestion ? (
                  <div 
                    className="problem-statement-html"
                    dangerouslySetInnerHTML={{ __html: selectedQuestion.description }} 
                  />
                ) : (
                  <p className="placeholder-text">Select a problem from the curriculum to begin.</p>
                )}
              </div>
            </section>

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
                <button
                  onClick={handleGetAiFeedback}
                  disabled={isAiLoading}
                  className="ai-feedback-btn"
                >
                  {isAiLoading ? 'Analyzing...' : 'Get AI Feedback'}
                </button>
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
          </main>

          <aside className="panel feedback-panel" style={{ borderLeft: '1px solid var(--border)' }}>
            {/* Interviewer section moved here */}
            <div className="interviewer-section">
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

              <div className="panel-header sub-header">Interviewer</div>
              <div className="chat-container">
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
        </>
      )}

      {report && (
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

      <footer className={`status-bar status--${status.type}`}>
        <div className="status-indicator">
          {status.type === 'loading' && <div className="pulse-dot" />}
          {status.type === 'success' && <span className="status-icon">✓</span>}
          {status.type === 'error' && <span className="status-icon">⚠</span>}
          <span className="status-text">{status.text}</span>
        </div>
        <div className="status-right">
          <span className="status-model">Gemini 1.5 Pro</span>
          <span className="status-sep">|</span>
          <span className="status-latency">Principal Agent Active</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
