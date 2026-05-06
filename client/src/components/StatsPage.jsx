import React from 'react';

export default function StatsPage({
  questions,
  savedPracticeSessions,
  questionStatuses,
  onBack
}) {
  const completedCount = Object.values(questionStatuses).filter(q => q?.status === 'done').length;
  const needsReviewCount = Object.values(questionStatuses).filter(q => q?.status === 'needs_review').length;
  const completionRate = questions.length > 0 ? Math.round((completedCount / questions.length) * 100) : 0;

  // Count problems by category
  const categoryCounts = questions.reduce((acc, q) => {
    const cat = q.category || 'General';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="stats-page">
      <div className="page-header">
        <button className="back-btn" onClick={onBack} title="Back">
          ← Back
        </button>
        <h1>Your Progress & Statistics</h1>
      </div>

      <div className="stats-content">
        {/* Overview Section */}
        <section className="stats-card overview-card">
          <h2>Overview</h2>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-value">{questions.length}</div>
              <div className="stat-label">Problems Available</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{completedCount}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{needsReviewCount}</div>
              <div className="stat-label">Needs Review</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{savedPracticeSessions.length}</div>
              <div className="stat-label">Active Sessions</div>
            </div>
          </div>
        </section>

        {/* Progress Section */}
        <section className="stats-card progress-card">
          <h2>Overall Progress</h2>
          <div className="progress-bar-container">
            <div className="progress-label">
              <span>Completion Rate</span>
              <span className="progress-percent">{completionRate}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <div className="progress-detail">
              {completedCount} of {questions.length} problems completed
            </div>
          </div>
        </section>

        {/* Category Breakdown */}
        <section className="stats-card categories-card">
          <h2>Problems by Category</h2>
          <div className="categories-list">
            {Object.entries(categoryCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([category, count]) => {
                const categoryProblems = questions.filter(q => (q.category || 'General') === category);
                const categoryCompleted = categoryProblems.filter(q => questionStatuses[q.id]?.status === 'done').length;
                const categoryRate = Math.round((categoryCompleted / count) * 100);

                return (
                  <div key={category} className="category-item">
                    <div className="category-header">
                      <span className="category-name">{category}</span>
                      <span className="category-count">{count} problems</span>
                    </div>
                    <div className="category-progress">
                      <div className="small-progress-bar">
                        <div
                          className="small-progress-fill"
                          style={{ width: `${categoryRate}%` }}
                        />
                      </div>
                      <span className="category-rate">
                        {categoryCompleted}/{count} ({categoryRate}%)
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        {/* Sessions Summary */}
        {savedPracticeSessions.length > 0 && (
          <section className="stats-card sessions-card">
            <h2>Your Practice Sessions</h2>
            <div className="sessions-summary">
              {savedPracticeSessions.map((session) => (
                <div key={session.id} className="session-summary-item">
                  <div className="session-name">{session.sessionName}</div>
                  <div className="session-details">
                    <span>{session.newPerDay} new/day</span>
                    <span>•</span>
                    <span>{session.pastPerDay} past/day</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
