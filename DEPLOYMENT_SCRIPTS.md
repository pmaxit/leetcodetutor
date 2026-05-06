# 🚀 Deployment Scripts - One-Command Deployment

## Overview

Two simple scripts to deploy and manage your AI Interview Platform:

- **`deploy.sh`** — Deploy everything (server, client, ngrok) in one command
- **`stop-deployment.sh`** — Cleanly stop all services

---

## Prerequisites

Before running the deployment script, ensure:

✅ **ngrok installed** — `snap install ngrok` or `apt install ngrok`
✅ **ngrok authenticated** — `ngrok config add-authtoken <TOKEN>`
✅ **LM Studio running** — `lms status` (shows Server: ON)
✅ **Node.js installed** — `node --version`

---

## Quick Start

### Deploy Everything
```bash
chmod +x deploy.sh
./deploy.sh
```

That's it! The script will:
1. ✅ Verify prerequisites (Node.js, ngrok, LM Studio)
2. ✅ Check available ports
3. ✅ Install server dependencies
4. ✅ Install client dependencies
5. ✅ Verify configuration
6. ✅ Test server health
7. ✅ Start Node.js server
8. ✅ (Optional) Start React dev server
9. ✅ Start ngrok tunnel
10. ✅ Display public URL
11. ✅ Show health status

### Stop Everything
```bash
./stop-deployment.sh
```

Cleanly stops:
- Node.js server
- React dev server (if running)
- ngrok tunnel

---

## Script Output Example

```
╔════════════════════════════════════════════════════════════╗
║  🚀 AI Interview Platform - Complete Deployment Script    ║
╚════════════════════════════════════════════════════════════╝

════════════════════════════════════════════════════════════
STEP 1: Verifying Prerequisites
════════════════════════════════════════════════════════════

✅ Node.js installed: v18.16.0
✅ npm installed: 9.6.7
✅ ngrok installed: 3.3.5
✅ LM Studio is running

════════════════════════════════════════════════════════════
STEP 2: Checking Ports
════════════════════════════════════════════════════════════

✅ Port 3005 is available

════════════════════════════════════════════════════════════
STEP 3: Installing Server Dependencies
════════════════════════════════════════════════════════════

✅ Server dependencies already installed

════════════════════════════════════════════════════════════
STEP 4: Installing Client Dependencies
════════════════════════════════════════════════════════════

✅ Client dependencies already installed

════════════════════════════════════════════════════════════
STEP 7: Starting Servers
════════════════════════════════════════════════════════════

📝 Starting Node.js server...
   Server PID: 12345
   Logs: tail -f /tmp/interview-platform/server.log
✅ Server started successfully on port 3005

════════════════════════════════════════════════════════════
STEP 8: Starting ngrok Tunnel
════════════════════════════════════════════════════════════

🔗 Starting ngrok tunnel on port 3005...
   ngrok PID: 12346
✅ ngrok tunnel created

════════════════════════════════════════════════════════════
🎉 DEPLOYMENT COMPLETE!
════════════════════════════════════════════════════════════

📱 Access Points:
  Local Server:     http://localhost:3005
  Public URL:       https://abc123def456.ngrok-free.app
  React Dev:        http://localhost:5173

🔗 Share this URL with anyone:
  https://abc123def456.ngrok-free.app

📊 Monitor Requests:
  http://127.0.0.1:4040

📝 View Logs:
  Server: tail -f /tmp/interview-platform/server.log
  Client: tail -f /tmp/interview-platform/client.log
  ngrok:  tail -f /tmp/interview-platform/ngrok.log

🛑 Stop Services:
  ./stop-deployment.sh

════════════════════════════════════════════════════════════
Health Checks
════════════════════════════════════════════════════════════

✅ Server Health: healthy (LM Studio: connected)

Deployment is live! Press Ctrl+C to stop all services.

Process IDs saved to: /tmp/interview-platform/pids.txt
```

---

## What the Script Does

### `deploy.sh` Workflow

```
1. Verify Prerequisites
   ├─ Check Node.js
   ├─ Check npm
   ├─ Check ngrok
   ├─ Check LM Studio
   └─ Confirm all ready

2. Check Ports
   ├─ Verify port 3005 available (server)
   ├─ Verify port 5173 available (client, optional)
   └─ Offer to kill processes if ports in use

3. Install Dependencies
   ├─ npm install (server)
   ├─ cd client && npm install (client)
   └─ Skip if already installed

4. Verify Configuration
   ├─ Check .env exists
   ├─ Check LLM_BASE_URL configured
   └─ Validate settings

5. Test Server Health
   ├─ Temporarily start server
   ├─ Test /api/health endpoint
   ├─ Kill test server
   └─ Report results

6. Start Services
   ├─ Start Node.js server (background)
   ├─ Ask to start React dev server (optional)
   ├─ Wait for services to initialize
   └─ Verify they're running

7. Start ngrok Tunnel
   ├─ Create HTTPS tunnel to localhost:3005
   ├─ Extract public URL
   ├─ Verify tunnel is active
   └─ Display public URL

8. Display Summary
   ├─ Show all access points (local, public)
   ├─ Show monitoring URLs
   ├─ Show log locations
   └─ Show stop command

9. Run Health Checks
   ├─ Verify server responds
   ├─ Check LM Studio connection
   └─ Display health status

10. Keep Running
    ├─ Trap Ctrl+C signal
    ├─ Save PIDs to file
    ├─ Wait indefinitely
    └─ Kill all services on exit
```

### `stop-deployment.sh` Workflow

```
1. Read PID file
   └─ From /tmp/interview-platform/pids.txt

2. Kill Server
   ├─ Send SIGTERM
   ├─ Wait 1 second
   ├─ Send SIGKILL if still running
   └─ Confirm stopped

3. Kill Client
   ├─ Send SIGTERM
   ├─ Wait 1 second
   ├─ Send SIGKILL if still running
   └─ Confirm stopped

4. Kill ngrok
   ├─ Send SIGTERM
   ├─ Wait 1 second
   ├─ Send SIGKILL if still running
   └─ Confirm stopped

5. Cleanup
   ├─ Kill any remaining npm processes
   ├─ Kill any remaining ngrok processes
   └─ Display log file locations
```

---

## Customization

### Change Server Port
```bash
SERVER_PORT=8080 ./deploy.sh
```

### Change Client Port
```bash
CLIENT_PORT=3000 ./deploy.sh
```

### Both Ports
```bash
SERVER_PORT=8080 CLIENT_PORT=3000 ./deploy.sh
```

### Skip Client (Server Only)
```bash
./deploy.sh
# Answer 'n' to "Start React dev server?" prompt
```

---

## Logs

All logs are saved to `/tmp/interview-platform/`:

```
/tmp/interview-platform/
├─ server.log              # Node.js server logs
├─ client.log              # React dev server logs
├─ ngrok.log               # ngrok tunnel logs
├─ server-npm-install.log  # npm install output
├─ client-npm-install.log  # npm install output
├─ server-startup-test.log # Health check test
└─ pids.txt                # Process IDs
```

View logs in real-time:
```bash
tail -f /tmp/interview-platform/server.log
tail -f /tmp/interview-platform/ngrok.log
```

---

## Troubleshooting

### Script exits immediately
Check the error message. Common issues:
- ngrok not installed: `snap install ngrok`
- ngrok not authenticated: `ngrok config add-authtoken <TOKEN>`
- Node.js not installed: install from nodejs.org
- LM Studio offline: run `lms` and start Local Server

### Port already in use
The script will ask to kill the process using that port. Choose 'y' to proceed.

### ngrok tunnel fails to start
- Check ngrok is authenticated: `ngrok config check`
- Check ngrok not already running: `pkill -f ngrok`
- Check network connection: `ping 8.8.8.8`

### Server won't start
Check logs:
```bash
tail -50 /tmp/interview-platform/server.log
```

Common issues:
- Dependencies missing: `npm install` (script should catch this)
- Port already in use: check with `lsof -i :3005`
- .env missing: create it with `cp .env.example .env`

### LM Studio not responding
```bash
# Check LM Studio status
lms status

# Start LM Studio
lms

# In LM Studio app, click "Local Server" button
```

---

## Advanced Usage

### Monitor in Real-Time
```bash
# Terminal 1: Deploy
./deploy.sh

# Terminal 2: Watch server logs
tail -f /tmp/interview-platform/server.log

# Terminal 3: Monitor ngrok
http://127.0.0.1:4040
```

### Deploy to Different Port
```bash
SERVER_PORT=8080 ./deploy.sh
# Access at: https://xxxx.ngrok-free.app
```

### Run in Background
```bash
nohup ./deploy.sh > deployment.log 2>&1 &
```

Then stop with:
```bash
./stop-deployment.sh
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_PORT` | `3005` | Node.js server port |
| `CLIENT_PORT` | `5173` | React dev server port |

---

## File Locations

| File | Purpose |
|------|---------|
| `deploy.sh` | Main deployment script |
| `stop-deployment.sh` | Cleanup script |
| `.env` | Configuration (server reads this) |
| `package.json` | Server dependencies |
| `client/package.json` | Client dependencies |
| `server/index.js` | Node.js server entry point |
| `client/src/App.jsx` | React app entry point |

---

## One-Liner Commands

```bash
# Deploy and keep running
./deploy.sh

# Deploy in background
nohup ./deploy.sh > /tmp/deployment.log 2>&1 &

# View logs
tail -f /tmp/interview-platform/server.log

# Stop all
./stop-deployment.sh

# Check health
curl http://localhost:3005/api/health | jq .

# Check ngrok status
curl http://127.0.0.1:4040/api/tunnels | jq .
```

---

## Frequently Asked Questions

**Q: Do I need to run deploy.sh every time?**
A: No, only the first time or after major changes. Keep the server running with ngrok tunnel active.

**Q: Can I access the app without ngrok URL?**
A: Yes, locally at `http://localhost:3005` (only from your desktop).

**Q: Does the public URL change?**
A: Yes, with free ngrok (every restart). Upgrade to paid for permanent URL.

**Q: Can I stop just the client or ngrok?**
A: Use `stop-deployment.sh` or manually `kill <PID>`. Script saves PIDs in `/tmp/interview-platform/pids.txt`.

**Q: What if I want to use a different LLM?**
A: Edit `.env` file and change `LLM_BASE_URL` and `LLM_MODEL`.

---

## Summary

```bash
# Deploy (10 seconds):
./deploy.sh

# Get public URL from output

# Stop (5 seconds):
./stop-deployment.sh
```

That's it! Your app is now live on the internet! 🚀
