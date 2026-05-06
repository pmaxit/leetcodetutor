import React, { useState, useEffect, useRef } from 'react';

const DebugBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [height, setHeight] = useState(250);
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const logsEndRef = useRef(null);
  const eventSourceRef = useRef(null);
  const dragStartRef = useRef(0);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'instant' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  useEffect(() => {
    const connectToLogs = () => {
      const API = import.meta.env.PROD ? '' : 'http://127.0.0.1:3005';
      const eventSource = new EventSource(`${API}/api/logs/stream`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLogs((prev) => {
            const newLogs = [...prev, data];
            return newLogs.slice(-1000); // Keep last 1000 logs
          });
        } catch (err) {
          console.error('Failed to parse log:', err);
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
        eventSource.close();
        setTimeout(connectToLogs, 3000);
      };
    };

    connectToLogs();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartRef.current = e.clientY;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const delta = dragStartRef.current - e.clientY;
    setHeight((prev) => Math.max(100, Math.min(800, prev + delta)));
    dragStartRef.current = e.clientY;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const getLogColor = (source) => {
    switch (source) {
      case 'SERVER':
        return '#60a5fa';
      case 'CLIENT':
        return '#4ade80';
      case 'NGROK':
        return '#facc15';
      default:
        return '#a78bfa';
    }
  };

  const getLogBgColor = (level) => {
    switch (level) {
      case 'error':
        return '#7f1d1d';
      case 'warn':
        return '#78350f';
      case 'success':
        return '#15803d';
      default:
        return 'transparent';
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const copyLogs = () => {
    const logText = logs
      .map((log) => `[${log.timestamp}] ${log.source}: ${log.message}`)
      .join('\n');
    navigator.clipboard.writeText(logText).then(() => {
      alert('Logs copied to clipboard!');
    });
  };

  return (
    <>
      {/* Toggle Button */}
      <div className="debug-toggle-container">
        <button
          className="debug-toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
          title="Toggle debug terminal"
        >
          <span className={`debug-dot ${isConnected ? 'connected' : 'disconnected'}`} />
          <span className="debug-label">🐛 DEBUG</span>
          <span className="debug-log-count">{logs.length}</span>
        </button>
      </div>

      {/* Debug Terminal Panel */}
      {isOpen && (
        <div className="debug-terminal" style={{ height: `${height}px` }}>
          {/* Drag handle */}
          <div
            className="debug-resize-handle"
            onMouseDown={handleMouseDown}
            title="Drag to resize"
          />

          {/* Header */}
          <div className="debug-terminal-header">
            <div className="debug-terminal-title">
              <span className={`debug-status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
              <span>Deployment Logs</span>
              <span className={`debug-connection-text ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? '● Connected' : '● Reconnecting...'}
              </span>
            </div>
            <div className="debug-terminal-actions">
              <button onClick={copyLogs} className="debug-action-btn" title="Copy all logs to clipboard">📋 Copy</button>
              <button onClick={clearLogs} className="debug-action-btn">Clear</button>
              <button onClick={() => setIsOpen(false)} className="debug-action-btn">Close</button>
            </div>
          </div>

          {/* Logs container */}
          <div className="debug-terminal-content">
            {logs.length === 0 ? (
              <div className="debug-empty-state">
                <div>Waiting for logs...</div>
                <div style={{ fontSize: '11px', color: '#666' }}>Logs will appear here as services run</div>
              </div>
            ) : (
              logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`debug-line debug-level-${log.level || 'info'}`}
                  style={{
                    backgroundColor: getLogBgColor(log.level),
                  }}
                >
                  <span className="debug-time">{log.timestamp}</span>
                  <span
                    className="debug-source"
                    style={{ color: getLogColor(log.source) }}
                  >
                    {log.source}
                  </span>
                  <span className="debug-msg">{log.message}</span>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      )}
    </>
  );
};

export default DebugBar;
