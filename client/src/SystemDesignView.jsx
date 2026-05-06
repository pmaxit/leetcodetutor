import React, { useState, useEffect, useRef } from 'react';
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';

const API = 'http://localhost:3005';

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
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [completedStages, setCompletedStages] = useState(new Set());
  const [stageAnswers, setStageAnswers] = useState([]);
  const [finalReport, setFinalReport] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [activeTab, setActiveTab] = useState('whiteboard');
  const tldrawEditor = useRef(null);
  const textareaRef = useRef(null);

  const stages = question?.stages || [];
  const currentStage = stages[currentStageIndex];

  // Reset when question changes
  useEffect(() => {
    setCurrentStageIndex(0);
    setAnswer('');
    setEvaluation(null);
    setCompletedStages(new Set());
    setStageAnswers([]);
    setFinalReport(null);
    setShowHint(false);
  }, [question?.id]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim() && (!tldrawEditor.current || activeTab === 'answer')) return;
    setIsEvaluating(true);
    setEvaluation(null);

    const shapes = tldrawEditor.current?.getCurrentPageShapes() || [];
    const whiteboardShapes = shapes.map(s => ({
      type: s.type,
      text: s.props?.text || '',
    }));

    try {
      const res = await fetch(`${API}/api/sd/stage/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionId: question.id, stageAnswers }),
        });
        const data = await res.json();
        setFinalReport(data.report);
      } catch (err) {
        console.error(err);
      }
    } else {
      setCurrentStageIndex(prev => prev + 1);
      setAnswer('');
      setEvaluation(null);
      setShowHint(false);
    }
  };

  if (!question) {
    return (
      <div className="sd-empty">
        <div className="sd-empty-icon">🏗️</div>
        <div className="sd-empty-title">Select a System Design Problem</div>
        <div className="sd-empty-sub">Choose a problem from the sidebar to begin your staged interview.</div>
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

          {/* Tab toggle: Whiteboard vs Text Answer */}
          <div className="sd-answer-tabs">
            <button
              className={`sd-atab ${activeTab === 'whiteboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('whiteboard')}
            >
              🖊 Whiteboard
            </button>
            <button
              className={`sd-atab ${activeTab === 'answer' ? 'active' : ''}`}
              onClick={() => setActiveTab('answer')}
            >
              📝 Type Answer
            </button>
          </div>

          {/* Text answer area */}
          <textarea
            ref={textareaRef}
            className="sd-answer-input"
            placeholder={`Type your answer for: ${currentStage?.name}...`}
            value={answer}
            onChange={e => setAnswer(e.target.value)}
          />

          {/* Submit */}
          <button
            className="sd-submit-btn"
            onClick={handleSubmitAnswer}
            disabled={isEvaluating || (!answer.trim())}
          >
            {isEvaluating ? (
              <span className="sd-loading-dot">Evaluating<span>.</span><span>.</span><span>.</span></span>
            ) : 'Submit Answer →'}
          </button>

          {/* Evaluation Result */}
          <EvaluationCard
            evaluation={evaluation}
            onAdvance={handleAdvance}
            isLastStage={currentStageIndex >= stages.length - 1}
          />
        </div>

        {/* Right: Whiteboard */}
        <div className="sd-whiteboard-panel" style={{ display: activeTab === 'whiteboard' ? 'flex' : 'none' }}>
          <div className="sd-wb-label">Whiteboard — draw your architecture</div>
          <div className="sd-wb-canvas">
            <Tldraw
              onMount={(editor) => { tldrawEditor.current = editor; }}
              inferDarkMode
            />
          </div>
        </div>

        {/* Right: Hidden when text mode */}
        {activeTab === 'answer' && (
          <div className="sd-whiteboard-panel sd-reference-panel">
            <div className="sd-wb-label">Reference Framework</div>
            <div className="sd-ref-content">
              <div className="sd-ref-title">HelloInterview Delivery Framework</div>
              <div className="sd-ref-steps">
                {stages.map((s, i) => (
                  <div key={s.id} className={`sd-ref-step ${i === currentStageIndex ? 'current' : ''} ${completedStages.has(i) ? 'done' : ''}`}>
                    <span className="sd-ref-step-icon">{s.icon}</span>
                    <span>{s.name}</span>
                    {completedStages.has(i) && <span className="sd-ref-check">✓</span>}
                  </div>
                ))}
              </div>
              <div className="sd-ref-tip">
                <strong>Pro Tip:</strong> Use the whiteboard tab to draw components and data flows. The AI evaluates both your drawing and typed answer together.
              </div>
              {question.originalUrl && (
                <a href={question.originalUrl} target="_blank" rel="noreferrer" className="sd-full-solution-link">
                  🔗 View Full System Design Solution
                </a>
              )}
              {question.youtube_url && (
                <div className="video-embed-container" style={{ marginTop: '1rem' }}>
                  <iframe
                    width="100%"
                    height="200"
                    src={`https://www.youtube.com/embed/${question.youtube_url.split('v=')[1]?.split('&')[0] || question.youtube_url.split('/').pop()}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                  ></iframe>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Final Report */}
      {finalReport && (
        <FinalReport report={finalReport} onClose={() => setFinalReport(null)} />
      )}
    </div>
  );
}
