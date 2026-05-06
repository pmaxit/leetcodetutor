import React, { useState } from 'react';

export default function SettingsPage({
  practiceConfig,
  setPracticeConfig,
  savedPracticeSessions,
  onGenerateSchedule,
  onDeleteSession,
  onRenameSession,
  onBack,
  renamingSessionId,
  renamingSessionName,
  setRenamingSessionId,
  setRenamingSessionName,
  practiceSessionId
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerateSchedule();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <button className="back-btn" onClick={onBack} title="Back">
          ← Back
        </button>
        <h1>Settings & Practice Management</h1>
      </div>

      <div className="settings-content">
        <section className="settings-card">
          <h2>Create New Practice Session</h2>
          <p className="section-description">Configure a personalized 30-day interview preparation plan</p>

          <div className="config-form">
            <div className="config-field">
              <label>New Questions Per Day</label>
              <input
                type="number"
                min="1"
                max="10"
                value={practiceConfig.newPerDay}
                onChange={(e) => setPracticeConfig({ ...practiceConfig, newPerDay: parseInt(e.target.value) })}
              />
              <small>How many new problems to practice daily</small>
            </div>

            <div className="config-field">
              <label>Past Questions Per Day (Repetitions)</label>
              <input
                type="number"
                min="0"
                max="10"
                value={practiceConfig.pastPerDay}
                onChange={(e) => setPracticeConfig({ ...practiceConfig, pastPerDay: parseInt(e.target.value) })}
              />
              <small>How many previously solved problems to review daily</small>
            </div>

            <button
              className="generate-btn"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate 30-Day Schedule'}
            </button>
          </div>
        </section>

        <section className="settings-card">
          <h2>Manage Practice Sessions</h2>
          <p className="section-description">View, rename, or delete your practice sessions</p>

          <div className="sessions-list">
            {savedPracticeSessions.length === 0 ? (
              <div className="no-sessions-msg">
                <p>No saved sessions yet. Create one above to get started!</p>
              </div>
            ) : (
              <div className="sessions-grid">
                {savedPracticeSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`session-card ${practiceSessionId === session.id ? 'active' : ''}`}
                  >
                    <div className="session-header">
                      {renamingSessionId === session.id ? (
                        <input
                          type="text"
                          className="rename-input"
                          value={renamingSessionName}
                          onChange={(e) => setRenamingSessionName(e.target.value)}
                          onBlur={() => onRenameSession(session.id, session.sessionName)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              onRenameSession(session.id, session.sessionName);
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <h3
                          onClick={() => {
                            setRenamingSessionId(session.id);
                            setRenamingSessionName(session.sessionName);
                          }}
                          className="session-title"
                        >
                          {session.sessionName}
                        </h3>
                      )}
                      {practiceSessionId === session.id && (
                        <span className="active-badge">Active</span>
                      )}
                    </div>

                    <div className="session-meta">
                      <span className="meta-item">
                        <strong>{session.newPerDay}</strong> new/day
                      </span>
                      <span className="meta-item">
                        <strong>{session.pastPerDay}</strong> past/day
                      </span>
                    </div>

                    <div className="session-actions">
                      <button
                        className="session-action-btn rename"
                        onClick={() => {
                          setRenamingSessionId(session.id);
                          setRenamingSessionName(session.sessionName);
                        }}
                        title="Rename session"
                      >
                        ✏️ Rename
                      </button>
                      <button
                        className="session-action-btn delete"
                        onClick={() => onDeleteSession(session.id)}
                        title="Delete session"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
