# 🚀 Deployment Guide - Expose Local App via ngrok

## Overview

This guide shows you how to expose your locally running AI Interview Platform to the internet using **ngrok** — a simple, free service that creates a public HTTPS tunnel to your local server in seconds.

### Why ngrok?
- ✅ **One command** to expose your app
- ✅ **Built-in HTTPS** with SSL
- ✅ **Free tier** available
- ✅ **No server needed** — keeps everything local
- ✅ **Shareable URL** — works from anywhere

### Architecture
```
Your Desktop                    ngrok Tunnel              Internet
┌──────────────────────┐       ┌──────────┐            ┌─────────┐
│ LM Studio :1234      │       │          │            │         │
│ Node Server :3005    │◄─────►│  ngrok   │◄──────────►│ Browser │
│ React Client :5173   │       │  tunnel  │            │         │
└──────────────────────┘       └──────────┘            └─────────┘
```

---

## Prerequisites

- ✅ Node.js and npm installed
- ✅ LM Studio installed and running on port 1234
- ✅ Model `google/gemma-3n-e4b` loaded
- ✅ Git installed

---

## Step 1: Install ngrok

### Option A: Using apt (Ubuntu/Debian)
```bash
curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok
```

### Option B: Using snap
```bash
snap install ngrok
```

### Verify Installation
```bash
ngrok version
# Should output: ngrok version X.X.X
```

---

## Step 2: Create ngrok Account and Get Auth Token

### 1. Sign up
Visit: https://ngrok.com/sign-up

### 2. Get your auth token
- Log in to ngrok dashboard
- Copy your auth token from the dashboard
- Keep it private (like a password)

### 3. Configure ngrok locally
```bash
ngrok config add-authtoken <YOUR_AUTH_TOKEN_HERE>
```

**Example:**
```bash
ngrok config add-authtoken 2eHbdXrF_FakeTokenExample_nC9dXXXXXXX
```

---

## Step 3: Verify LM Studio is Running

### Check Status
```bash
lms status
```

### Expected Output
```
Server: ON (port: 1234)

Loaded Models
  · google/gemma-3n-e4b - 4.24 GB
```

**If not running:**
1. Open LM Studio application
2. Load model: `google/gemma-3n-e4b`
3. Click "Local Server" and start it

---

## Step 4: Start the Application Server

### Terminal 1: Start Node.js Server
```bash
npm install    # Install dependencies if needed
npm run dev    # Start server with nodemon (auto-reload)
```

### Expected Output
```
============================================================
🤖 LLMService Initialization
============================================================
📍 LLM Provider: 🟢 LM Studio (Local)
🌐 Base URL: http://localhost:1234/v1
🏷️  Model: google/gemma-3n-e4b
============================================================

Server running on http://0.0.0.0:3005
```

### Verify Server is Running
```bash
# In another terminal:
curl http://localhost:3005/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "llmstudio": "connected",
  "models": ["google/gemma-3n-e4b", "liquid/lfm2.5-1.2b"],
  "timestamp": "2026-05-05T..."
}
```

---

## Step 5: Start React Dev Server (Optional)

### Terminal 2: Start React Client
```bash
cd client
npm install    # Install dependencies if needed
npm run dev    # Start Vite dev server
```

### Expected Output
```
VITE v8.0.10  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

---

## Step 6: Expose via ngrok

### Terminal 3: Start ngrok Tunnel
```bash
# Expose the Node.js server (port 3005)
ngrok http 3005
```

### Expected Output
```
ngrok                                     (Ctrl+C to quit)

Session Status                online
Account                       puneet@example.com (Plan: Free)
Version                       3.3.5
Region                        United States (us)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123def456.ngrok-free.app → http://localhost:3005

Connections                   ttl     opn     dl      in      out
                              0       0       0       0B      0B
```

**Your public URL is:** `https://abc123def456.ngrok-free.app`

---

## Step 7: Access the Application

### From Any Browser
```
https://abc123def456.ngrok-free.app
```

Replace `abc123def456` with your actual ngrok URL from Step 6.

### What You Should See
- ✅ Welcome message from the interviewer
- ✅ List of problems to solve
- ✅ Chat interface ready to use

---

## Step 8: Test the Chat

### Run a Chat Test
1. **Select a problem** from the list (e.g., "Two Sum")
2. **Type a message** (e.g., "hello")
3. **Click Send**
4. **Verify response** appears from AI interviewer

### Expected Behavior
- Status shows "Ready" (not "Connection Error")
- AI response appears in chat within 2-5 seconds
- No errors in server terminal

---

## ✅ Deployment Checklist

### Before You Start
- [ ] ngrok installed: `ngrok version`
- [ ] ngrok authenticated: `ngrok config add-authtoken <token>`
- [ ] LM Studio running: `lms status`
- [ ] Model loaded: `google/gemma-3n-e4b`

### During Deployment
- [ ] Terminal 1: `npm run dev` (Node.js server)
- [ ] Terminal 3: `ngrok http 3005` (tunnel running)
- [ ] Server health check passed: `curl http://localhost:3005/api/health`

### After Deployment
- [ ] App loads: `https://xxx.ngrok-free.app`
- [ ] Chat works: sent message and got response
- [ ] No errors in server terminal
- [ ] Status bar shows "Ready" (not "Connection Error")

---

## 🎯 Using Your Public URL

Once you have your ngrok URL (`https://xxx.ngrok-free.app`), you can:

✅ **Share with others** — They can access the app from any device, any location
✅ **Test from phone** — Open URL on your smartphone to test UI
✅ **Integrate with GCP** — Forward API requests from GCP to this URL
✅ **Monitor live** — View real-time traffic at `http://127.0.0.1:4040`

---

## 📊 Monitoring

### ngrok Web Dashboard
```
Open: http://127.0.0.1:4040
```

View:
- All requests to your app
- Request/response headers and bodies
- Performance metrics

---

## 🆘 Troubleshooting

### Issue: "Cannot connect to LM Studio"

**Problem:** LM Studio offline or not running

**Solution:**
```bash
# Check LM Studio
lms status

# Start LM Studio if needed
# Open application and click "Local Server" button
```

### Issue: "ngrok tunnel offline"

**Problem:** ngrok disconnected or crashed

**Solution:**
```bash
# Restart ngrok in Terminal 3
Ctrl+C
ngrok http 3005

# Get new URL (changes each time)
```

### Issue: "Server won't start"

**Problem:** Port 3005 already in use or dependencies missing

**Solution:**
```bash
# Check what's using port 3005
lsof -i :3005

# Kill process if needed
kill -9 <PID>

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try again
npm run dev
```

### Issue: "ngrok says 'invalid auth token'"

**Problem:** Auth token not configured or invalid

**Solution:**
```bash
# Get new auth token from ngrok dashboard
# https://dashboard.ngrok.com/auth/your-authtoken

# Reconfigure
ngrok config add-authtoken <NEW_TOKEN>

# Try again
ngrok http 3005
```

### Issue: "Chat returns 'Connection Error'"

**Problem:** LM Studio offline or tunnel not working

**Solution:**
```bash
# 1. Check LM Studio
lms status

# 2. Check server health
curl http://localhost:3005/api/health | jq .

# 3. Check LM Studio is accessible from server
curl http://localhost:1234/v1/models | jq .

# 4. Restart everything
# Kill all terminals with Ctrl+C
# Restart in order: LM Studio → Node server → ngrok
```

---

## 💡 Tips

**Keep URL Stable (Paid Plan)**
- Free ngrok URLs change each restart
- Paid plan offers permanent static URL
- For testing, free tier is fine

**Monitor Performance**
- Check `http://127.0.0.1:4040` for traffic
- See response times and error rates
- Useful for debugging

**Share URL Safely**
- ngrok URLs are public
- Anyone with URL can access your app
- Use paid plan for production with authentication

---

## 🔐 Security Notes

✅ HTTPS by default — traffic is encrypted
✅ Random URL — not easily guessable
✅ .env credentials — keep out of repo
⚠️ Public access — anyone with URL can use the app
⚠️ Rate limits — free tier has limits, check ngrok docs

---

## 🚀 Next Steps

1. **Follow Steps 1-8** above to deploy
2. **Share the ngrok URL** with others: `https://xxx.ngrok-free.app`
3. **Monitor in dashboard:** `http://127.0.0.1:4040`
4. **Keep server & LM Studio running** while app is in use
5. **For persistent deployment,** consider Cloud Run or Heroku

---

## 📚 Reference Commands

| Task | Command |
|------|---------|
| Install ngrok | `snap install ngrok` or `apt install ngrok` |
| Configure token | `ngrok config add-authtoken <token>` |
| Start server | `npm run dev` |
| Start tunnel | `ngrok http 3005` |
| Check server health | `curl http://localhost:3005/api/health` |
| View requests | `http://127.0.0.1:4040` |
| Kill tunnel | `Ctrl+C` |
| Check LM Studio | `lms status` |

---

**You're all set! Deploy with confidence! 🚀**
