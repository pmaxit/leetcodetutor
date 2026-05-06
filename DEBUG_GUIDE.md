# AI Interview Platform - Debugging Guide

## Issue: "Connection Error" from AI Interviewer

This guide helps you troubleshoot the connection error when the AI interviewer fails to respond.

---

## Quick Checklist

- [ ] **LM Studio is running** on `localhost:1234`
- [ ] **Server is running** on `localhost:3005`
- [ ] **Client is running** on `localhost:5173`
- [ ] **.env file** is configured correctly
- [ ] **Network connectivity** is working

---

## Step 1: Verify LM Studio is Running

### Check if LM Studio is accessible:

```bash
# Test connection to LM Studio
curl -s http://localhost:1234/v1/models | jq .

# Should return JSON with available models
```

**Expected output:**
```json
{
  "object": "list",
  "data": [
    {
      "id": "google/gemma-3n-e4b",
      "object": "model",
      ...
    }
  ]
}
```

**If this fails:**
- ❌ LM Studio is NOT running
- ✅ Start LM Studio and load the `google/gemma-3n-e4b` model
- Make sure it's listening on `http://localhost:1234`

---

## Step 2: Check Server Logs

### Terminal 1 (Server):
Watch the server logs for detailed error messages:

```bash
npm run dev
```

**Look for:**
- ✅ `🤖 LLMService Initialization` - LLM service started
- ✅ `💬 CHAT REQUEST RECEIVED` - Request came in
- ✅ `🔄 LLM Request Starting...` - About to call LM Studio
- ❌ `❌ LLM GENERATION ERROR` - Connection failed

### Terminal 2 (Client):
```bash
cd client
npm run dev
```

---

## Step 3: Use the Health Check Button

1. Open the app in browser: `http://localhost:5173` (or `http://localhost:3005` if built)
2. Look at the **bottom status bar** (footer)
3. Click the **blue button** that says "Checking LLM Studio..." or shows the connection status
4. **Green ✓** = LM Studio is connected
5. **Red ✗** = LM Studio is NOT responding

**Console output:**
```
🏥 Health Check Endpoint Called
✅ LM Studio is responding
📊 Available models: ['google/gemma-3n-e4b']
```

---

## Step 4: Manual API Testing

### Test the health endpoint:
```bash
curl -X GET http://localhost:3005/api/health
```

**Expected response (if working):**
```json
{
  "status": "healthy",
  "llmstudio": "connected",
  "models": ["google/gemma-3n-e4b"],
  "timestamp": "2026-05-04T22:40:00.000Z"
}
```

**Expected response (if failing):**
```json
{
  "status": "unhealthy",
  "llmstudio": "disconnected",
  "error": "ECONNREFUSED: Connection refused at 127.0.0.1:1234",
  "timestamp": "2026-05-04T22:40:00.000Z",
  "hint": "Make sure LM Studio is running on http://localhost:1234"
}
```

### Test chat endpoint:
```bash
curl -X POST http://localhost:3005/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, what is dynamic programming?",
    "selectedQuestion": {
      "id": "1",
      "title": "Two Sum",
      "hints": ["Use a hash map"]
    }
  }'
```

---

## Step 5: Check Environment Variables

Verify `.env` file is correct:

```bash
cat .env
```

**Required variables:**
```
LLM_BASE_URL=http://localhost:1234/v1
LLM_API_KEY=lm-studio
LLM_MODEL=google/gemma-3n-e4b
PORT=3005
```

---

## Step 6: Common Issues & Solutions

### ❌ "ECONNREFUSED: Connection refused at 127.0.0.1:1234"

**Cause:** LM Studio is not running

**Solution:**
1. Install LM Studio from https://lmstudio.ai
2. Open LM Studio
3. Go to the **Models** tab
4. Search for and download: `google/gemma-3n-e4b`
5. Go to the **Local Server** tab
6. Click **Start Server**
7. Verify it shows: "Server is running on http://localhost:1234"

### ❌ "Socket hang up" or "Read ECONNRESET"

**Cause:** Connection was established but LM Studio crashed or closed

**Solution:**
1. Check LM Studio is still running
2. Restart the server: `npm run dev`
3. Reload the browser: `Ctrl+Shift+R` (hard refresh)

### ❌ Status bar shows "LM Studio Disconnected ✗"

**Cause:** Health check endpoint is failing

**Solution:**
1. Click the health button again (it will retry)
2. Check server logs for errors
3. Verify LM Studio is loaded with the correct model
4. Check firewall/network settings

### ❌ "Failed to parse solution JSON"

**Cause:** LM Studio returned invalid JSON

**Solution:**
1. Check server logs: `Failed to parse solution JSON. Raw text:...`
2. The model may not be responding correctly
3. Try restarting LM Studio
4. Verify model is `google/gemma-3n-e4b`

---

## Step 7: Detailed Server Logs

The updated server now provides detailed logging:

```
============================================================
🤖 LLMService Initialization
============================================================
📍 LLM Provider: 🟢 LM Studio (Local)
🌐 Base URL: http://localhost:1234/v1
🏷️  Model: google/gemma-3n-e4b
============================================================

============================================================
💬 CHAT REQUEST RECEIVED
============================================================
⏰ Time: 2026-05-04T22:40:00.000Z
📋 Question: Two Sum
💬 Message: "Can you explain the approach?"
🔖 Session ID: 1
============================================================

🔄 Starting constraint extraction and response generation...
🤖 Calling interviewer agent...

============================================================
🔄 LLM Request Starting...
============================================================
⏰ Timestamp: 2026-05-04T22:40:00.000Z
📝 Message count: 3
🏷️  Model: google/gemma-3n-e4b
🌐 Base URL: http://localhost:1234/v1
============================================================

📤 Sending request to LM Studio...
✅ Response received successfully!
📊 Response status: Valid
✨ Content length: 245 characters
```

**If you see errors, share the full logs starting from "🔄 LLM Request Starting..."**

---

## Step 8: Browser DevTools

Open browser DevTools (`F12`) and check:

1. **Console tab**: Look for red error messages
2. **Network tab**: 
   - Find the `/api/chat` request
   - Click it and check the Response
   - Should see streaming events: `type: "status"` then `type: "result"`
3. **Application tab**: Check Local Storage and Cookies

---

## Final Checklist Before You Give Up

```
✅ LM Studio running: curl http://localhost:1234/v1/models
✅ Server running: npm run dev (in root)
✅ Client running: npm run dev (in client/)
✅ .env configured correctly
✅ Model downloaded in LM Studio: google/gemma-3n-e4b
✅ Health check button shows "LM Studio Connected ✓"
✅ Server logs show: "✅ Response received successfully!"
✅ Browser console shows no red errors
```

If all above are ✅, the system should work!

---

## Collecting Debug Info

If you still have issues, run this and share the output:

```bash
# 1. Check LM Studio
curl -v http://localhost:1234/v1/models 2>&1 | head -20

# 2. Check server health
curl -v http://localhost:3005/api/health 2>&1

# 3. Check .env
cat .env

# 4. Check node version
node --version
npm --version
```

---

## Need More Help?

1. Check the **server terminal** for error logs (they're detailed now)
2. Click the **health check button** in the status bar
3. Open **Browser DevTools** (`F12`) to see network requests
4. Share the **full error message** from the server logs
