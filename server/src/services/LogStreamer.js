const { EventEmitter } = require('events');

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

class LogStreamer extends EventEmitter {
  constructor() {
    super();
    this.buffer = [];
    this.maxBufferSize = 500;
    this.clients = new Set();
    this.isIntercepting = false;
  }

  start() {
    if (this.isIntercepting) return;
    this.isIntercepting = true;

    console.log = (...args) => {
      originalConsoleLog.apply(console, args);
      this.captureLog(args, 'server', 'info');
    };
    console.error = (...args) => {
      originalConsoleError.apply(console, args);
      this.captureLog(args, 'server', 'error');
    };
    console.warn = (...args) => {
      originalConsoleWarn.apply(console, args);
      this.captureLog(args, 'server', 'warn');
    };
  }

  stop() {
    if (!this.isIntercepting) return;
    this.isIntercepting = false;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  }

  captureLog(args, source, defaultLevel) {
    // Convert all arguments to a single string
    const message = args.map(a => {
      if (a === undefined) return 'undefined';
      if (a === null) return 'null';
      if (typeof a === 'object') {
        try {
          return JSON.stringify(a);
        } catch (e) {
          return '[Object]';
        }
      }
      return String(a);
    }).join(' ');

    const level = this.detectLogLevel(message) || defaultLevel;
    this.addLog(message, source, level);
  }

  detectLogLevel(line) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('error') || lowerLine.includes('❌')) return 'error';
    if (lowerLine.includes('warn') || lowerLine.includes('⚠️')) return 'warn';
    if (lowerLine.includes('success') || lowerLine.includes('✅')) return 'success';
    return null;
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
