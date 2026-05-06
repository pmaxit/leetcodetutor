# LM Studio Configuration & Debugging Guide

## ✅ Changes Made

### 1. Updated `.env` Configuration
```
# Now pointing to LM Studio (Local)
LLM_BASE_URL=http://localhost:1234/v1
LLM_API_KEY=lm-studio
LLM_MODEL=google/gemma-3n-e4b

# Commented out Gemini (was causing conflict)
# GEMINI_API_KEY=...
```

### 2. Enhanced LLMService Logging
LLMService now displays which LLM it's using on startup:
```
============================================================
🤖 LLMService Initialization
============================================================
📍 LLM Provider: 🟢 LM Studio (Local)
🌐 Base URL: http://localhost:1234/v1
🏷️  Model: google/gemma-3n-e4b
============================================================
```

---

## 🔧 LM Studio Setup Checklist

### Prerequisites
- [ ] LM Studio installed on your machine
- [ ] LM Studio running (should be listening on `http://localhost:1234`)
- [ ] Model `google/gemma-3n-e4b` loaded in LM Studio

### Verify LM Studio is Running

```bash
# Test LM Studio is accessible
curl http://localhost:1234/v1/models

# Expected response:
# {
#   "object": "list",
#   "data": [
#     {
#       "id": "google/gemma-3n-e4b",
#       "object": "model",
#       "created": 1234567890,
#       "owned_by": "user"
#     }
#   ]
# }
```

If you get a connection error: **LM Studio is not running or not on port 1234**

---

## 🚀 How to Start

### Step 1: Start LM Studio
```bash
# Open LM Studio application
# Make sure:
# 1. A model is loaded (google/gemma-3n-e4b or similar)
# 2. Server is running on port 1234
# 3. You see "Server running at http://localhost:1234"
```

### Step 2: Start the Interview Server
```bash
cd /home/puneet/Projects/interviews/machine-learning

# Install dependencies (if needed)
npm install

# Start server
npm start

# You should see:
# ============================================================
# 🤖 LLMService Initialization
# ============================================================
# 📍 LLM Provider: 🟢 LM Studio (Local)
# 🌐 Base URL: http://localhost:1234/v1
# 🏷️  Model: google/gemma-3n-e4b
# ============================================================
# Server running on http://0.0.0.0:3005
```

### Step 3: Test via API
```bash
# In another terminal, test the API
curl http://localhost:3005/api/questions | head -20

# Should return problems from the database
```

---

## ❌ Troubleshooting

### Problem: "Cannot reach LM Studio"
```
Error: Failed to fetch from http://localhost:1234/v1
```

**Solution:**
1. Verify LM Studio is running: `curl http://localhost:1234/v1/models`
2. Check port 1234 is not blocked
3. Check firewall settings
4. Restart LM Studio

### Problem: "Model not found"
```
Error: Model 'google/gemma-3n-e4b' not found
```

**Solution:**
1. Open LM Studio
2. Load the `google/gemma-3n-e4b` model
3. Wait for it to load completely
4. Restart the server

### Problem: Still getting Gemini errors
```
Error: Using wrong API (Gemini instead of LM Studio)
```

**Solution:**
1. Verify `.env` has `GEMINI_API_KEY` commented out:
   ```bash
   grep GEMINI_API_KEY .env
   # Should output: # GEMINI_API_KEY=...
   ```
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install` again
4. Restart server

---

## 🧪 Testing the Interview Flow

### Test 1: Check LLMService Initialization
```bash
# Look at server startup logs
npm start | grep "LLM Provider"

# Expected:
# 📍 LLM Provider: 🟢 LM Studio (Local)
```

### Test 2: Query an Interview Question
```bash
# Get a question
curl http://localhost:3005/api/questions | jq '.[0]'

# Expected: Problem with hints and other fields
```

### Test 3: Initialize Interview
```bash
curl -X POST http://localhost:3005/api/interviewer/init \
  -H "Content-Type: application/json" \
  -d '{
    "question": {
      "id": 1,
      "title": "Contains Duplicate",
      "hints": ["hint1", "hint2", "hint3"]
    }
  }' | jq .

# Expected: Initial probe with Hint 1
```

### Test 4: Chat with AI (Full Flow)
```bash
curl -X POST http://localhost:3005/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I need help with this problem",
    "selectedQuestion": {
      "id": 1,
      "title": "Contains Duplicate",
      "hints": ["hint1", "hint2", "hint3"]
    }
  }' \
  -N

# Watch for SSE events
# Expected: Socratic guidance using hints (not full code)
```

---

## 📊 Configuration Verification

### Check Environment Variables
```bash
# Verify .env is correct
cat .env | grep -E "LLM_|GEMINI_"

# Expected output:
# LLM_BASE_URL=http://localhost:1234/v1
# LLM_API_KEY=lm-studio
# LLM_MODEL=google/gemma-3n-e4b
# # GEMINI_API_KEY=... (commented)
```

### Check LLMService Code
```bash
# Verify logging is in place
grep -A5 "LLM Provider" server/src/services/LLMService.js

# Should show the logging code
```

### Check LM Studio Connection
```bash
# Test connectivity
node -e "
const fetch = require('node-fetch');
fetch('http://localhost:1234/v1/models')
  .then(r => r.json())
  .then(d => console.log('✓ LM Studio is running:', d.data[0]?.id))
  .catch(e => console.log('✗ Cannot reach LM Studio:', e.message))
"
```

---

## 🔄 Common Workflow

### Morning Setup
```bash
# 1. Open LM Studio (loads model)
# 2. Verify server is starting with LM Studio logs
npm start

# 3. See the LLMService initialization:
# 📍 LLM Provider: 🟢 LM Studio (Local)
# ✓ Ready to use
```

### If Interview Fails
```bash
# 1. Check LM Studio is still running
curl http://localhost:1234/v1/models

# 2. Check server logs for errors
# (Look for "Error" or "failed" in npm start output)

# 3. Restart if needed:
# Kill: Ctrl+C
# Restart: npm start
```

---

## 📝 What Changed

### Before (Problem)
- `.env` had `GEMINI_API_KEY` set
- LLMService detected Gemini and used cloud API
- Requests failed or went to wrong endpoint

### After (Fixed)
- `.env` now configures LM Studio explicitly
- LLMService uses local LM Studio at `http://localhost:1234/v1`
- Better logging so you can see which LLM is being used

---

## 🎯 Next Steps

1. **Verify LM Studio is running** on port 1234
2. **Start the server**: `npm start`
3. **Check the logs** for the LLM Provider line
4. **Test an interview** to confirm it works

---

## Questions?

If you still get errors:
1. Share the exact error message
2. Verify LM Studio is running: `curl http://localhost:1234/v1/models`
3. Check server logs for which LLM is being used
4. Check `.env` to confirm Gemini is commented out

