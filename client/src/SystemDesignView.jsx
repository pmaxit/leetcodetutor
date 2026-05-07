import { useState, useEffect, useRef } from 'react';
import { Tldraw, getSnapshot, loadSnapshot } from 'tldraw';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'tldraw/tldraw.css';
import 'katex/dist/katex.min.css';

const API = 'http://localhost:3005';
const TLDRAW_LICENSE_KEY = import.meta.env.VITE_TLDRAW_LICENSE_KEY;
const CAN_USE_TLDRAW = !import.meta.env.PROD || Boolean(TLDRAW_LICENSE_KEY);
const normalizeHeading = (text = '') => text.toLowerCase().replace(/[^a-z]/g, '');
const getSdHeadingChipClass = (text = '') => {
  const token = normalizeHeading(text);
  if (token.startsWith('recommendation')) return 'sd-chip-recommendation';
  if (token.startsWith('pros')) return 'sd-chip-pros';
  if (token.startsWith('cons')) return 'sd-chip-cons';
  if (token.startsWith('alternative')) return 'sd-chip-alternative';
  if (token.startsWith('probe')) return 'sd-chip-probe';
  return 'sd-chip-default';
};

// LLMs frequently emit headings like `###Recommendation` (no space after the
// hashes), which CommonMark treats as plain text. Insert the missing space so
// ReactMarkdown can render them as <h3> and our chip styling kicks in.
const normalizeSdMarkdown = (text = '') => {
  if (!text) return text;
  return text
    .split('\n')
    .map((line) => line.replace(/^(\s{0,3})(#{1,6})([^\s#])/, '$1$2 $3'))
    .join('\n');
};

// ─── Stage Progress Bar ────────────────────────────────────────────────────────
function StageProgressBar({ stages, currentStageIndex, completedStages }) {
  return (
    <div className="sd-stage-bar">
      {stages.map((s, i) => (
        <div
          key={s.id}
          className={`sd-stage-pip ${
            completedStages.has(i) ? 'completed' : i === currentStageIndex ? 'active' : ''
          }`}
          title={s.name}
        >
          <span className="sd-stage-icon">{s.icon}</span>
          <span className="sd-stage-pip-label">{s.name}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Evaluation Card ──────────────────────────────────────────────────────────
function EvaluationCard({ evaluation, onAdvance, isLastStage }) {
  if (!evaluation) return null;
  const score = evaluation.readinessScore || 0;
  const scoreColor = score >= 4 ? '#22c55e' : score >= 3 ? '#facc15' : '#ef4444';

  return (
    <div className="sd-eval-card">
      <div className="sd-eval-header">
        <span className="sd-eval-score" style={{ color: scoreColor }}>
          {score}/5
        </span>
        <span className="sd-eval-badge" style={{ background: evaluation.readyToAdvance ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: evaluation.readyToAdvance ? '#22c55e' : '#ef4444', border: `1px solid ${evaluation.readyToAdvance ? '#22c55e' : '#ef4444'}` }}>
          {evaluation.readyToAdvance ? '✓ Stage Cleared' : '↺ Revisit'}
        </span>
      </div>

      {evaluation.strengths && (
        <div className="sd-eval-section">
          <div className="sd-eval-label">✓ Strengths</div>
          <div className="sd-eval-text">{evaluation.strengths}</div>
        </div>
      )}

      {evaluation.gap && (
        <div className="sd-eval-section gap">
          <div className="sd-eval-label">⚠ Gap Identified</div>
          <div className="sd-eval-text">{evaluation.gap}</div>
        </div>
      )}

      {evaluation.probeQuestion && (
        <div className="sd-eval-section probe">
          <div className="sd-eval-label">🎯 Follow-Up Probe</div>
          <div className="sd-eval-text probe-q">"{evaluation.probeQuestion}"</div>
        </div>
      )}

      {evaluation.readyToAdvance && (
        <button className="sd-advance-btn" onClick={onAdvance}>
          {isLastStage ? '🏁 Complete Interview' : 'Next Stage →'}
        </button>
      )}
    </div>
  );
}

// ─── Final Report Modal ───────────────────────────────────────────────────────
function FinalReport({ report, onClose }) {
  if (!report) return null;
  const rubric = report.rubric || {};
  const avg = Object.values(rubric).reduce((a, b) => a + b, 0) / Object.values(rubric).length;

  const levelColor = report.level === 'Staff+' ? '#a855f7' : report.level === 'Senior' ? '#38bdf8' : '#facc15';

  return (
    <div className="modal-overlay">
      <div className="sd-report-modal">
        <div className="sd-report-header">
          <h2>System Design Report</h2>
          <div className="sd-report-level" style={{ color: levelColor }}>{report.level || 'Senior'}</div>
          <div className="sd-report-overall">{report.overallScore || Math.round(avg)}%</div>
        </div>

        <div className="sd-rubric-grid">
          {Object.entries(rubric).map(([k, v]) => (
            <div key={k} className="sd-rubric-item">
              <div className="sd-rubric-label">{k}</div>
              <div className="sd-rubric-bar-wrap">
                <div
                  className="sd-rubric-bar"
                  style={{
                    width: `${v}%`,
                    background: v >= 80 ? '#22c55e' : v >= 60 ? '#38bdf8' : v >= 40 ? '#facc15' : '#ef4444'
                  }}
                />
              </div>
              <div className="sd-rubric-score">{v}</div>
            </div>
          ))}
        </div>

        {report.topStrengths && (
          <div className="sd-report-section">
            <div className="sd-report-section-title">💪 Top Strengths</div>
            {report.topStrengths.map((s, i) => (
              <div key={i} className="sd-report-bullet strength">✓ {s}</div>
            ))}
          </div>
        )}

        {report.topImprovement && (
          <div className="sd-report-section">
            <div className="sd-report-section-title">🔧 Key Improvement</div>
            <div className="sd-report-bullet improvement">{report.topImprovement}</div>
          </div>
        )}

        {report.critique && (
          <div className="sd-report-section">
            <div className="sd-report-section-title">📝 Detailed Critique</div>
            <div className="sd-report-critique">{report.critique}</div>
          </div>
        )}

        <button className="send-btn" onClick={onClose} style={{ marginTop: '1.5rem', width: '100%' }}>
          Close Report
        </button>
      </div>
    </div>
  );
}

// ─── Main System Design View ──────────────────────────────────────────────────
export default function SystemDesignView({ question }) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [evaluation, setEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [completedStages, setCompletedStages] = useState(new Set());
  const [stageAnswers, setStageAnswers] = useState([]);
  const [finalReport, setFinalReport] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [activeTab, setActiveTab] = useState('whiteboard');
  const [practiceSolutions, setPracticeSolutions] = useState([]);
  const [isPracticeLoading, setIsPracticeLoading] = useState(false);
  const [solutionMarkdown, setSolutionMarkdown] = useState('');
  const [solutionTitle, setSolutionTitle] = useState('');
  const [isSolutionLoading, setIsSolutionLoading] = useState(false);
  const [solutionLoadError, setSolutionLoadError] = useState('');
  const [clarifyInput, setClarifyInput] = useState('');
  const [clarifyMessages, setClarifyMessages] = useState([]);
  const [isClarifying, setIsClarifying] = useState(false);
  const [whiteboardReady, setWhiteboardReady] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const tldrawEditor = useRef(null);
  const textareaRef = useRef(null);
  const blankWhiteboardSnapshotRef = useRef(null);
  const pendingWhiteboardSnapshotRef = useRef(null);
  const lastWhiteboardSerializedRef = useRef('');
  const saveTimeoutRef = useRef(null);
  const whiteboardSaveIntervalRef = useRef(null);
  const isApplyingWhiteboardRef = useRef(false);
  const isHydratingDraftRef = useRef(false);
  const hasLoadedDraftRef = useRef(false);

  const stages = question?.stages || [];
  const currentStage = stages[currentStageIndex];
  const answer = stageAnswers[currentStageIndex] || '';
  const isSolutionOnlyMobile = isMobileViewport;
  const fetchWithAuth = (url, options = {}) => {
    const token = localStorage.getItem('ag_token');
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const getSolutionSlugFromQuestion = (selectedQuestion) => {
    return selectedQuestion?.solutionSlug || null;
  };

  const getRawTldrawSnapshot = () => {
    if (isSolutionOnlyMobile) return null;
    if (!tldrawEditor.current) return null;
    try {
      return getSnapshot(tldrawEditor.current.store);
    } catch (error) {
      console.error('Failed to get SD whiteboard snapshot:', error);
      return null;
    }
  };

  const applyWhiteboardSnapshot = (snapshotPayload) => {
    if (!tldrawEditor.current) return;
    const payload = snapshotPayload || blankWhiteboardSnapshotRef.current;
    if (!payload) return;
    try {
      isApplyingWhiteboardRef.current = true;
      loadSnapshot(tldrawEditor.current.store, payload);
      const rawSnapshot = getRawTldrawSnapshot();
      lastWhiteboardSerializedRef.current = rawSnapshot ? JSON.stringify(rawSnapshot) : '';
    } catch (error) {
      console.error('Failed to load SD whiteboard snapshot:', error);
    } finally {
      setTimeout(() => {
        isApplyingWhiteboardRef.current = false;
      }, 0);
    }
  };

  const buildDraftState = () => ({
    currentStageIndex,
    stageAnswers,
    completedStages: Array.from(completedStages),
  });

  const persistDraft = async () => {
    if (!question?.id || isHydratingDraftRef.current || !hasLoadedDraftRef.current) return;
    const rawSnapshot = getRawTldrawSnapshot();
    const whiteboardSnapshot = rawSnapshot || pendingWhiteboardSnapshotRef.current || null;

    try {
      await fetchWithAuth(`${API}/api/sd/draft/${question.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftState: buildDraftState(),
          whiteboardSnapshot,
        }),
      });
    } catch (error) {
      console.error('Failed to save SD draft:', error);
    }
  };
  const getWhiteboardShapesForSubmission = () => {
    const shapes = tldrawEditor.current?.getCurrentPageShapes?.() || [];
    return shapes.map((s) => ({
      type: s.type,
      text: s.props?.text || '',
      label: s.props?.label || '',
    }));
  };

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const media = window.matchMedia('(max-width: 1024px)');
    const applyMatch = (eventLike) => setIsMobileViewport(Boolean(eventLike.matches));
    applyMatch(media);
    media.addEventListener('change', applyMatch);
    return () => media.removeEventListener('change', applyMatch);
  }, []);

  useEffect(() => {
    if (isSolutionOnlyMobile && activeTab !== 'answer') {
      setActiveTab('answer');
    }
  }, [isSolutionOnlyMobile, activeTab]);

  useEffect(() => {
    if (!question?.id) return;
    const token = localStorage.getItem('ag_token');
    if (!token) return;

    const loadDraft = async () => {
      isHydratingDraftRef.current = true;
      try {
        const res = await fetchWithAuth(`${API}/api/sd/draft/${question.id}`);
        const data = await res.json();
        const draftState = data?.draftState;
        const maxIndex = Math.max(0, stages.length - 1);
        const safeIndex = Math.min(
          Number.isInteger(draftState?.currentStageIndex) ? draftState.currentStageIndex : 0,
          maxIndex
        );
        const answers = Array.isArray(draftState?.stageAnswers) ? draftState.stageAnswers : [];
        const completed = Array.isArray(draftState?.completedStages)
          ? draftState.completedStages.filter((idx) => Number.isInteger(idx))
          : [];

        setCurrentStageIndex(safeIndex);
        setStageAnswers(answers);
        setCompletedStages(new Set(completed));

        const snapshot = data?.whiteboardSnapshot || null;
        pendingWhiteboardSnapshotRef.current = snapshot;
        if (tldrawEditor.current && !isSolutionOnlyMobile) {
          applyWhiteboardSnapshot(snapshot);
        }
      } catch (error) {
        console.error('Failed to load SD draft:', error);
      } finally {
        isHydratingDraftRef.current = false;
        hasLoadedDraftRef.current = true;
      }
    };

    loadDraft();
  }, [question?.id, isSolutionOnlyMobile]);

  useEffect(() => {
    const token = localStorage.getItem('ag_token');
    if (!token) return;

    const loadPracticeSolutions = async () => {
      setIsPracticeLoading(true);
      try {
        const res = await fetch(`${API}/api/sd/solutions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setPracticeSolutions(data?.solutions || []);
      } catch (error) {
        console.error('Failed to load system design practice solutions:', error);
        setPracticeSolutions([]);
      } finally {
        setIsPracticeLoading(false);
      }
    };

    loadPracticeSolutions();
  }, []);

  useEffect(() => {
    if (!question?.id) return;
    const solutionSlug = getSolutionSlugFromQuestion(question);
    if (!solutionSlug) {
      setSolutionMarkdown('');
      setSolutionTitle('');
      setSolutionLoadError('No linked markdown solution for this question.');
      return;
    }

    const loadInlineSolution = async () => {
      setIsSolutionLoading(true);
      setSolutionLoadError('');
      try {
        const res = await fetchWithAuth(`${API}/api/sd/solutions/${solutionSlug}/markdown`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to load solution (${res.status})`);
        }
        const data = await res.json();
        setSolutionTitle(data?.title || '');
        setSolutionMarkdown(data?.markdown || '');
      } catch (error) {
        setSolutionMarkdown('');
        setSolutionTitle('');
        setSolutionLoadError(error.message || 'Failed to load markdown solution.');
      } finally {
        setIsSolutionLoading(false);
      }
    };

    loadInlineSolution();
  }, [question?.id]);

  const handleSubmitAnswer = async () => {
    const whiteboardShapes = getWhiteboardShapesForSubmission();
    const hasWhiteboardContent = whiteboardShapes.some(
      (s) => (s.text && s.text.trim()) || (s.label && s.label.trim()) || s.type !== 'text'
    );
    if (!answer.trim() && !hasWhiteboardContent) return;
    setIsEvaluating(true);
    setEvaluation(null);

    try {
      const res = await fetch(`${API}/api/sd/stage/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ag_token')}` },
        body: JSON.stringify({
          questionId: question.id,
          stageId: currentStage.id,
          userAnswer: answer,
          whiteboardShapes,
        }),
      });
      const data = await res.json();
      setEvaluation(data.evaluation);

      // Save answer for final report
      const newAnswers = [...stageAnswers];
      newAnswers[currentStageIndex] = answer;
      setStageAnswers(newAnswers);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleAdvance = async () => {
    const newCompleted = new Set(completedStages);
    newCompleted.add(currentStageIndex);
    setCompletedStages(newCompleted);

    if (currentStageIndex >= stages.length - 1) {
      // Final stage complete — generate report
      try {
        const res = await fetch(`${API}/api/sd/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ag_token')}` },
          body: JSON.stringify({ questionId: question.id, stageAnswers }),
        });
        const data = await res.json();
        setFinalReport(data.report);
      } catch (err) {
        console.error(err);
      }
    } else {
      setCurrentStageIndex(prev => prev + 1);
      setEvaluation(null);
      setShowHint(false);
    }
  };

  const handleResetAnswers = async () => {
    if (!question?.id) return;
    if (!window.confirm('Reset all stage answers and whiteboard for this system design question?')) return;

    isHydratingDraftRef.current = true;
    setCurrentStageIndex(0);
    setStageAnswers([]);
    setCompletedStages(new Set());
    setEvaluation(null);
    setFinalReport(null);
    setShowHint(false);
    setClarifyMessages([]);
    setClarifyInput('');
    pendingWhiteboardSnapshotRef.current = null;
    if (tldrawEditor.current && blankWhiteboardSnapshotRef.current) {
      applyWhiteboardSnapshot(null);
    }
    isHydratingDraftRef.current = false;
    hasLoadedDraftRef.current = true;

    try {
      await fetchWithAuth(`${API}/api/sd/draft/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: question.id }),
      });
    } catch (error) {
      console.error('Failed to reset SD draft:', error);
    }
  };

  const handleClarify = async () => {
    if (!clarifyInput.trim() || !question) return;
    const token = localStorage.getItem('ag_token');
    if (!token) return;

    const userMsg = clarifyInput.trim();
    setClarifyMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setClarifyInput('');
    setIsClarifying(true);

    const whiteboardShapes = getWhiteboardShapesForSubmission();

    const selectedQuestion = {
      ...question,
      category: question?.category || 'System Design',
    };

    try {
      const response = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMsg,
          selectedQuestion,
          stageId: currentStage?.id,
          whiteboardShapes,
        }),
      });

      if (!response.body) {
        setClarifyMessages((prev) => [
          ...prev,
          { role: 'ai', content: 'No response received from the interviewer.' },
        ]);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalText = null;
      let errorText = null;
      let aiPlaceholderIndex = null;
      let sawDelta = false;
      setClarifyMessages((prev) => {
        aiPlaceholderIndex = prev.length;
        return [...prev, { role: 'ai', content: '' }];
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'result') {
              finalText = data.response;
            } else if (data.type === 'delta') {
              sawDelta = true;
              setClarifyMessages((prev) => {
                if (aiPlaceholderIndex === null || !prev[aiPlaceholderIndex]) return prev;
                const next = [...prev];
                const current = next[aiPlaceholderIndex];
                next[aiPlaceholderIndex] = {
                  ...current,
                  content: `${current.content || ''}${data.delta || ''}`
                };
                return next;
              });
            } else if (data.type === 'error') {
              errorText = data.message || 'Interviewer error.';
            }
          } catch (err) {
            console.warn('Failed to parse SSE line', line, err);
          }
        }
      }

      if (errorText) {
        setClarifyMessages((prev) => {
          if (aiPlaceholderIndex === null || !prev[aiPlaceholderIndex]) {
            return [...prev, { role: 'ai', content: `Error: ${errorText}` }];
          }
          const next = [...prev];
          next[aiPlaceholderIndex] = { ...next[aiPlaceholderIndex], content: `Error: ${errorText}` };
          return next;
        });
      } else {
        setClarifyMessages((prev) => {
          if (aiPlaceholderIndex === null || !prev[aiPlaceholderIndex]) {
            return [...prev, { role: 'ai', content: finalText || 'No response available.' }];
          }
          const next = [...prev];
          next[aiPlaceholderIndex] = {
            ...next[aiPlaceholderIndex],
            content: sawDelta ? (finalText || next[aiPlaceholderIndex].content) : (finalText || 'No response available.')
          };
          return next;
        });
      }
    } catch (error) {
      console.error('SD clarification error:', error);
      setClarifyMessages((prev) => [
        ...prev,
        { role: 'ai', content: 'I could not clarify that right now. Please try again.' },
      ]);
    } finally {
      setIsClarifying(false);
    }
  };

  const renderReferenceSolutionPanel = () => (
    <div className="sd-whiteboard-panel sd-reference-panel">
      <div className="sd-wb-label">Reference</div>
      <div className="sd-ref-content">
        {question.originalUrl && (
          <a href={question.originalUrl} target="_blank" rel="noreferrer" className="sd-original-solution-link">
            🔗 View Full Solution
          </a>
        )}
        {!question.originalUrl && (
          <div className="placeholder-text">No reference solution link available.</div>
        )}
      </div>
    </div>
  );

  useEffect(() => {
    if (!question?.id || isHydratingDraftRef.current || !hasLoadedDraftRef.current) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      persistDraft();
    }, 700);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [question?.id, currentStageIndex, stageAnswers, completedStages]);

  useEffect(() => {
    if (isSolutionOnlyMobile) return undefined;
    if (!question?.id || !tldrawEditor.current || !whiteboardReady) return undefined;

    whiteboardSaveIntervalRef.current = setInterval(() => {
      if (isApplyingWhiteboardRef.current) return;
      const rawSnapshot = getRawTldrawSnapshot();
      if (!rawSnapshot) return;
      const serialized = JSON.stringify(rawSnapshot);
      if (serialized === lastWhiteboardSerializedRef.current) return;
      lastWhiteboardSerializedRef.current = serialized;
      pendingWhiteboardSnapshotRef.current = rawSnapshot;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        persistDraft();
      }, 700);
    }, 1500);

    return () => {
      if (whiteboardSaveIntervalRef.current) {
        clearInterval(whiteboardSaveIntervalRef.current);
        whiteboardSaveIntervalRef.current = null;
      }
    };
  }, [question?.id, whiteboardReady, isSolutionOnlyMobile]);

  if (!question) {
    return (
      <div className="sd-empty">
        <div className="sd-empty-icon">🏗️</div>
        <div className="sd-empty-title">Select a System Design Problem</div>
        <div className="sd-empty-sub">Choose a problem from the sidebar to begin your staged interview.</div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="sd-view">
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>No system design question selected.</p>
          <p>Please select a question from the sidebar to begin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sd-view">
      {/* Stage Progress */}
      <div className="sd-top-bar">
        <div className="sd-problem-title">
          <span className="sd-badge">System Design</span>
          {question.title}
          <span className={`sd-difficulty sd-difficulty--${question.difficulty?.toLowerCase()}`}>
            {question.difficulty}
          </span>
        </div>
        <StageProgressBar
          stages={stages}
          currentStageIndex={currentStageIndex}
          completedStages={completedStages}
        />
      </div>

      {/* Main Content */}
      <div className="sd-content">
        {isSolutionOnlyMobile ? (
          renderReferenceSolutionPanel()
        ) : (
          <>
        {/* Left: Stage Prompt + Answer */}
        <div className="sd-left-panel">
          {/* Stage Header */}
          <div className="sd-stage-header">
            <span className="sd-stage-num">Stage {currentStageIndex + 1} / {stages.length}</span>
            <span className="sd-stage-name">{currentStage?.icon} {currentStage?.name}</span>
          </div>

          {/* Stage Prompt */}
          <div className="sd-stage-prompt">
            <div className="sd-interviewer-label">Interviewer</div>
            <div className="sd-prompt-text" dangerouslySetInnerHTML={{
              __html: (currentStage?.prompt || '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            }} />
          </div>

          {/* Hint */}
          <div className="sd-hint-area">
            <button
              className="sd-hint-btn"
              onClick={() => setShowHint(h => !h)}
            >
              {showHint ? '▾ Hide Hint' : '▸ Show Hint'}
            </button>
            {showHint && (
              <div className="sd-hint-text">💡 {currentStage?.hint}</div>
            )}
          </div>

          {/* Tab toggle: Whiteboard vs Text Answer vs Solution */}
          <div className="sd-answer-tabs">
            {!isSolutionOnlyMobile && (
              <button
                className={`sd-atab ${activeTab === 'whiteboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('whiteboard')}
              >
                🖊 Whiteboard
              </button>
            )}
            <button
              className={`sd-atab ${activeTab === 'answer' ? 'active' : ''}`}
              onClick={() => setActiveTab('answer')}
            >
              📝 Type Answer
            </button>
            {!isSolutionOnlyMobile && (
              <button
                className={`sd-atab ${activeTab === 'solution' ? 'active' : ''}`}
                onClick={() => setActiveTab('solution')}
              >
                📖 Solution
              </button>
            )}
          </div>

          {activeTab === 'solution' ? (
            <div className="sd-solution-view">
              {isSolutionLoading ? (
                <div className="placeholder-text">Loading solution...</div>
              ) : solutionLoadError ? (
                <div className="placeholder-text">{solutionLoadError}</div>
              ) : solutionMarkdown ? (
                <div className="sd-inline-solution-markdown">
                  {solutionTitle && (
                    <div style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '1.1rem' }}>{solutionTitle}</div>
                  )}
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      code({ inline, className, children, ...props }) {
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
                    {solutionMarkdown}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="placeholder-text">No solution available.</div>
              )}
            </div>
          ) : (
            <>
              {/* Text answer area */}
              <textarea
                ref={textareaRef}
                className="sd-answer-input"
                placeholder={`Type your answer for: ${currentStage?.name}... (⌘/Ctrl+Enter to submit)`}
                value={answer}
                onChange={(e) => {
                  const nextAnswer = e.target.value;
                  setStageAnswers((prev) => {
                    const next = [...prev];
                    next[currentStageIndex] = nextAnswer;
                    return next;
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    if (!isEvaluating) {
                      handleSubmitAnswer();
                    }
                  }
                }}
              />

              {/* Submit */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="sd-submit-btn"
                  onClick={handleSubmitAnswer}
                  disabled={isEvaluating}
                  style={{ flex: 1 }}
                >
                  {isEvaluating ? (
                    <span className="sd-loading-dot">Evaluating<span>.</span><span>.</span><span>.</span></span>
                  ) : 'Submit Answer →'}
                </button>
                <button className="action-btn-secondary" onClick={handleResetAnswers} type="button">
                  Reset Answers
                </button>
              </div>
            </>
          )}

          {/* Evaluation Result */}
          <EvaluationCard
            evaluation={evaluation}
            onAdvance={handleAdvance}
            isLastStage={currentStageIndex >= stages.length - 1}
          />

          {!isSolutionOnlyMobile && (
            <div className="sd-eval-card sd-clarify-card">
            <div className="sd-eval-label sd-clarify-title">
              🤖 Interviewer Clarification (Design Choices, Pros & Cons)
            </div>
            <div className="sd-clarify-thread">
              {clarifyMessages.length === 0 ? (
                <div className="sd-eval-text sd-clarify-empty">Ask follow-ups like "Why Redis over Postgres here?" or "What trade-off am I missing?"</div>
              ) : (
                clarifyMessages.map((m, i) => (
                  <div key={i} className={`sd-eval-section sd-clarify-bubble ${m.role === 'user' ? 'sd-clarify-user' : 'sd-clarify-ai'}`}>
                    <div className="sd-eval-label">{m.role === 'user' ? 'You' : 'Interviewer AI'}</div>
                    <div className="sd-eval-text sd-clarify-markdown">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          h3({ children, ...props }) {
                            const text = String(children || '');
                            const chipClass = getSdHeadingChipClass(text);
                            return (
                              <h3 className={`sd-heading-chip ${chipClass}`} {...props}>
                                {children}
                              </h3>
                            );
                          },
                          code({ inline, className, children, ...props }) {
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
                        {isClarifying && m.role === 'ai' && i === clarifyMessages.length - 1
                          ? `${normalizeSdMarkdown(m.content)}▋`
                          : normalizeSdMarkdown(m.content)}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="sd-clarify-input-row">
              <input
                className="sd-clarify-input"
                value={clarifyInput}
                onChange={(e) => setClarifyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    if (!isClarifying && clarifyInput.trim()) {
                      handleClarify();
                    }
                  }
                }}
                placeholder="Ask about trade-offs, alternatives, or weaknesses..."
              />
              <button className="sd-submit-btn sd-clarify-ask-btn" onClick={handleClarify} disabled={isClarifying || !clarifyInput.trim()}>
                {isClarifying ? 'Asking...' : 'Ask'}
              </button>
            </div>
            </div>
          )}
        </div>

        {/* Right: Whiteboard */}
        {!isSolutionOnlyMobile && (
          <div className="sd-whiteboard-panel" style={{ display: activeTab === 'whiteboard' ? 'flex' : 'none' }}>
          <div className="sd-wb-label">Whiteboard — draw your architecture</div>
          <div className="sd-wb-canvas">
            {CAN_USE_TLDRAW ? (
              <Tldraw
                onMount={(editor) => {
                  try {
                    tldrawEditor.current = editor;
                    setWhiteboardReady(true);
                    const initialSnapshot = getSnapshot(editor.store);
                    blankWhiteboardSnapshotRef.current = initialSnapshot;
                    lastWhiteboardSerializedRef.current = JSON.stringify(initialSnapshot);
                    if (pendingWhiteboardSnapshotRef.current) {
                      applyWhiteboardSnapshot(pendingWhiteboardSnapshotRef.current);
                    }
                  } catch (error) {
                    console.error('Failed to initialize SD whiteboard:', error);
                    // Keep editor mounted even if snapshot bootstrap fails.
                    tldrawEditor.current = editor;
                    setWhiteboardReady(true);
                  }
                }}
                inferDarkMode
                licenseKey={TLDRAW_LICENSE_KEY}
              />
            ) : (
              <div className="placeholder-text" style={{ padding: '1rem' }}>
                Whiteboard is unavailable in production without a Tldraw license key.
                Set `VITE_TLDRAW_LICENSE_KEY` and rebuild the client.
              </div>
            )}
          </div>
          </div>
        )}

        {/* Right: Hidden when text mode */}
        {activeTab === 'answer' && renderReferenceSolutionPanel()}
          </>
        )}
      </div>

      {/* Final Report */}
      {finalReport && (
        <FinalReport report={finalReport} onClose={() => setFinalReport(null)} />
      )}
    </div>
  );
}
