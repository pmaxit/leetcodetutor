# Deployment Guide - Local LM Studio Setup

## Overview
This guide helps you:
1. Access LM Studio running locally from a GCP VM
2. Configure the application for deployment with local LM server
3. Set up SSH tunneling for remote access

---

## Architecture

```
Your Desktop (Ubuntu)
├── LM Studio (running on localhost:1234)
└── Node.js Server (3005)

         ↓ SSH Tunnel (port forwarding)

GCP VM
├── Node.js Server (3005)
├── React Client (5173)
└── Connects to LM Studio via SSH tunnel
```

---

## Setup Steps

### Step 1: Get Your GCP VM Details

```bash
# Find your GCP VM's external IP
gcloud compute instances list

# Note: 
# - VM_IP: Your GCP VM's public IP (e.g., 34.123.45.67)
# - USER: Your GCP username (usually 'puneet' or similar)
# - LOCAL_PORT: 1234 (LM Studio port)
```

### Step 2: Create SSH Tunnel (From Your Desktop)

**Option A: Simple One-Time Tunnel**

```bash
# On your Ubuntu desktop, create tunnel to GCP VM
ssh -R 1234:localhost:1234 USER@VM_IP -N

# Example:
# ssh -R 1234:localhost:1234 puneet@34.123.45.67 -N

# This command:
# - Opens SSH connection to GCP VM
# - -R 1234:localhost:1234 = Reverse tunnel
#   Remote port 1234 (on VM) → Your local port 1234
# - -N = No shell (just tunnel)
# - Keep this terminal open while you work
```

**Option B: Persistent Tunnel (Recommended)**

Create a script to maintain the tunnel:

```bash
cat > ~/maintain-tunnel.sh << 'EOF'
#!/bin/bash

VM_IP="34.123.45.67"  # Replace with your GCP VM IP
USER="puneet"          # Replace with your GCP username

echo "🔗 Creating SSH tunnel to GCP VM..."
echo "Local port 1234 → VM port 1234"

ssh -R 1234:localhost:1234 ${USER}@${VM_IP} -N -v

echo "❌ Tunnel closed. Reconnecting in 5 seconds..."
sleep 5
EOF

chmod +x ~/maintain-tunnel.sh

# Run it:
~/maintain-tunnel.sh

# For persistent background tunnel (using screen or tmux):
screen -S lm-tunnel -d -m ~/maintain-tunnel.sh
```

### Step 3: Configure Environment Variables

Update `.env` to support deployment:

```bash
# .env (Development - uses local LM Studio)
LLM_BASE_URL=http://localhost:1234/v1
LLM_API_KEY=lm-studio
LLM_MODEL=google/gemma-3n-e4b

# .env.gcp (Deployment - uses SSH tunnel to local LM Studio)
LLM_BASE_URL=http://localhost:1234/v1
LLM_API_KEY=lm-studio
LLM_MODEL=google/gemma-3n-e4b
```

Both are the same because the SSH tunnel makes the VM see `localhost:1234` as your local LM Studio.

### Step 4: Deploy to GCP VM

**SSH into VM:**

```bash
ssh USER@VM_IP
# Example: ssh puneet@34.123.45.67
```

**On the GCP VM:**

```bash
# Clone or update your repo
git clone <your-repo> interview-platform
cd interview-platform

# Install dependencies
npm install
cd client && npm install && cd ..

# Start the server (with LM Studio tunnel established)
npm run dev
```

**Verify on VM:**

```bash
# Test tunnel is working
curl http://localhost:1234/v1/models

# Should return list of available models
```

---

## Deployment Checklist

### Before Deployment

- [ ] LM Studio is running on your desktop
- [ ] Model `google/gemma-3n-e4b` is loaded in LM Studio
- [ ] GCP VM is created and accessible via SSH
- [ ] You know your GCP VM IP address

### During Deployment

- [ ] SSH tunnel is active (keep `ssh -R` command running)
- [ ] Database is configured (if needed)
- [ ] `.env` file is set up on GCP VM
- [ ] `npm install` completed on VM
- [ ] Server started with `npm run dev`

### After Deployment

- [ ] Health check passes: `curl http://localhost:3005/api/health`
- [ ] Client loads in browser: `http://GCP_VM_IP:3005`
- [ ] Chat works and generates responses from LM Studio
- [ ] No "Connection Error" in UI

---

## Troubleshooting

### ❌ "Connection refused at localhost:1234"

**Problem:** SSH tunnel not active

**Solution:**
```bash
# Make sure this is running on your desktop:
ssh -R 1234:localhost:1234 USER@VM_IP -N

# Keep the terminal open (don't close it)
# Open a new terminal for other commands
```

### ❌ "LM Studio Disconnected" in UI

**Problem:** Tunnel dropped or LM Studio crashed locally

**Solution:**
```bash
# On your desktop:
# 1. Verify LM Studio is still running
lms status

# 2. Kill SSH tunnel and restart
Ctrl+C (in tunnel terminal)

# 3. Create new tunnel
ssh -R 1234:localhost:1234 USER@VM_IP -N
```

### ❌ "Permission denied (publickey)"

**Problem:** SSH key not configured

**Solution:**
```bash
# Use password authentication
ssh -o PasswordAuthentication=yes USER@VM_IP

# Or set up SSH keys (recommended):
# https://cloud.google.com/compute/docs/connect/create-manage-ssh-keys
```

### ✅ Test Everything

```bash
# On GCP VM, run these checks:

# 1. Can we reach local LM Studio?
curl -s http://localhost:1234/v1/models | jq .

# 2. Is server running?
curl -s http://localhost:3005/api/health | jq .

# 3. Check logs
tail -f server.log
```

---

## Port Mapping

| Component | Local (Desktop) | GCP VM | Purpose |
|-----------|-----------------|--------|---------|
| LM Studio | `localhost:1234` | `localhost:1234` (via SSH) | LLM API |
| Node Server | `localhost:3005` | `0.0.0.0:3005` | API Backend |
| React Client | `localhost:5173` | `0.0.0.0:5173` | Frontend |

---

## Quick Start Commands

### Desktop Setup
```bash
# Terminal 1: Create SSH tunnel
ssh -R 1234:localhost:1234 puneet@34.123.45.67 -N

# Terminal 2: Start local development
npm run dev
cd client && npm run dev
```

### GCP VM Setup
```bash
# Terminal 1: SSH into VM
ssh puneet@34.123.45.67

# Terminal 2: Start server
npm run dev

# Terminal 3: Check health
curl http://localhost:3005/api/health
```

---

## Production Deployment (Recommended)

For production, consider:

1. **Keep LM Studio on desktop** - Run your powerful desktop as LLM server
2. **Keep tunnel active** - Use systemd service or screen
3. **Use PM2** on GCP VM for process management
4. **Use nginx** as reverse proxy
5. **Enable HTTPS** with SSL certificate

---

## Reference

- **GCP VM SSH Documentation**: https://cloud.google.com/compute/docs/instances/connecting-advanced
- **SSH Port Forwarding**: https://linux.die.net/man/1/ssh
- **LM Studio**: https://lmstudio.ai
