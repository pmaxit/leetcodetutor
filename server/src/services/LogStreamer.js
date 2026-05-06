const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

class LogStreamer extends EventEmitter {
  constructor() {
    super();
    this.logDir = '/tmp/interview-platform';
    this.logFiles = {
      server: path.join(this.logDir, 'server.log'),
      client: path.join(this.logDir, 'client.log'),
      ngrok: path.join(this.logDir, 'ngrok.log'),
    };
    this.watchers = {};
    this.buffer = [];
    this.maxBufferSize = 500;
    this.clients = new Set();
  }

  start() {
    // Watch log files for changes
    Object.entries(this.logFiles).forEach(([source, filePath]) => {
      try {
        if (fs.existsSync(filePath)) {
          // Read existing logs
          this.readExistingLogs(filePath, source);

          // Watch for new logs
          this.watchers[source] = fs.watch(filePath, (eventType) => {
            if (eventType === 'change') {
              this.readNewLogs(filePath, source);
            }
          });
        }
      } catch (err) {
        console.log(`⚠️ Log file not found: ${filePath}`);
      }
    });
  }

  stop() {
    Object.values(this.watchers).forEach((watcher) => {
      if (watcher) watcher.close();
    });
  }

  readExistingLogs(filePath, source) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter(Boolean);
      lines.slice(-50).forEach((line) => {
        // Only include recent logs (last 50 lines per file)
        this.addLog(line, source, 'info');
      });
    } catch (err) {
      console.error(`Error reading log file ${filePath}:`, err.message);
    }
  }

  lastPositions = {};

  readNewLogs(filePath, source) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lastPos = this.lastPositions[source] || 0;

      if (content.length > lastPos) {
        const newContent = content.slice(lastPos);
        const lines = newContent.split('\n').filter(Boolean);

        lines.forEach((line) => {
          const level = this.detectLogLevel(line);
          this.addLog(line, source, level);
        });
      }

      this.lastPositions[source] = content.length;
    } catch (err) {
      console.error(`Error reading new logs from ${filePath}:`, err.message);
    }
  }

  detectLogLevel(line) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('error') || lowerLine.includes('❌')) return 'error';
    if (lowerLine.includes('warn') || lowerLine.includes('⚠')) return 'warn';
    if (lowerLine.includes('success') || lowerLine.includes('✅')) return 'success';
    return 'info';
  }

  addLog(message, source, level) {
    const log = {
      timestamp: new Date().toLocaleTimeString(),
      source,
      message: message.trim(),
      level,
    };

    this.buffer.push(log);

    // Keep buffer size manageable
    if (this.buffer.length > this.maxBufferSize) {
      this.buffer.shift();
    }

    // Broadcast to all connected clients
    this.broadcast(log);
  }

  broadcast(log) {
    this.clients.forEach((res) => {
      try {
        res.write(`data: ${JSON.stringify(log)}\n\n`);
      } catch (err) {
        // Client disconnected, will be removed by error handler
      }
    });
  }

  subscribe(res) {
    this.clients.add(res);

    // Send existing buffer to new client
    this.buffer.forEach((log) => {
      res.write(`data: ${JSON.stringify(log)}\n\n`);
    });

    // Handle client disconnect
    res.on('close', () => {
      this.clients.delete(res);
    });

    res.on('error', () => {
      this.clients.delete(res);
    });
  }

  getRecentLogs(count = 100) {
    return this.buffer.slice(-count);
  }
}

module.exports = new LogStreamer();
