# 🚀 GCP Deployment Summary - Local LM Studio

## What We've Set Up

### 1. ✅ Local LM Studio Configuration
- Your `.env` is already configured to use **local LM Studio**
- Settings: `LLM_BASE_URL=http://localhost:1234/v1`
- This ensures deployment uses your powerful desktop GPU/CPU

### 2. ✅ SSH Tunnel for VM Access
- Script: `setup-tunnel.sh` (interactive setup)
- Tunnel: `~/lm-studio-tunnel.sh` (automatic reconnection)
- Purpose: Forward local LM Studio (port 1234) to GCP VM

### 3. ✅ GCP VM Deployment
- Script: `deploy-on-vm.sh` (automatic setup)
- Handles: Clone, dependencies, .env, health checks
- Ready for: `npm run dev` to start server

---

## The Complete Flow

```
┌─────────────────────────────────┐
│   Your Desktop (Ubuntu)         │
├─────────────────────────────────┤
│ • LM Studio (port 1234)         │
│ • Development Server (port 3005)│
└────────────────────┬────────────┘
                     │
        ┌────────────┴────────────┐
        │   SSH Tunnel            │
        │ (Automatic Reconnect)   │
        │                         │
┌───────┴─────────────────────────┐
│   GCP VM                        │
├─────────────────────────────────┤
│ • Node.js Server (port 3005)    │
│ • React Client (port 5173)      │
│ • Connect to LM Studio via SSH  │
└─────────────────────────────────┘
        │
        │ HTTP/HTTPS
        │
    ┌───┴──────┐
    │  Browser │
    │(Any IP)  │
    └──────────┘
```

---

## Quick Start (3 Steps)

### Step 1: Desktop - Create SSH Tunnel
```bash
chmod +x setup-tunnel.sh
./setup-tunnel.sh

# Keep the ~/lm-studio-tunnel.sh running in Background
~/lm-studio-tunnel.sh &
```

### Step 2: Deploy to GCP VM
```bash
ssh puneet@YOUR_VM_IP

# On VM:
curl https://raw.githubusercontent.com/your-repo/interview-platform/main/deploy-on-vm.sh -o deploy.sh
chmod +x deploy.sh
./deploy.sh
```

### Step 3: Start Server
```bash
# Still on VM:
npm run dev

# Access at: http://YOUR_VM_IP:3005
```

---

## Why This Setup?

| Component | Location | Why |
|-----------|----------|-----|
| **LM Studio** | Desktop | Powerful GPU/CPU, always available |
| **Node Server** | GCP VM | Always-on, accessible from anywhere |
| **React Client** | GCP VM | Served from same VM as server |
| **SSH Tunnel** | Desktop | Secure connection, auto-reconnect |

---

## Key Benefits

✅ **Flexible** - Run LM Studio anywhere (desktop, laptop, etc.)
✅ **Secure** - SSH tunnel encrypts all traffic
✅ **Reliable** - Auto-reconnecting tunnel
✅ **Scalable** - Easy to add more VMs
✅ **Development Friendly** - Same setup for dev and prod

---

## Important Files

| File | Purpose |
|------|---------|
| `.env` | Configuration (already set for local LM Studio) |
| `setup-tunnel.sh` | Interactive tunnel setup script |
| `deploy-on-vm.sh` | Automated GCP VM deployment |
| `DEPLOYMENT_GUIDE.md` | Detailed deployment documentation |
| `QUICK_DEPLOY.md` | Quick reference guide |

---

## Configuration Details

### Desktop (.env - Already Correct)
```env
LLM_BASE_URL=http://localhost:1234/v1    # Local LM Studio
LLM_API_KEY=lm-studio
LLM_MODEL=google/gemma-3n-e4b
```

### GCP VM (.env - Auto-Generated)
```env
LLM_BASE_URL=http://localhost:1234/v1    # Via SSH tunnel
LLM_API_KEY=lm-studio
LLM_MODEL=google/gemma-3n-e4b
```

Both are identical because SSH tunnel makes the VM see your desktop's LM Studio as `localhost:1234`.

---

## Testing

### Desktop (Before Deployment)
```bash
# 1. Verify LM Studio
lms status

# 2. Verify Local Server
npm run dev
curl http://localhost:3005/api/health

# 3. Verify Client
cd client && npm run dev
# Open http://localhost:5173
```

### GCP VM (During Deployment)
```bash
# 1. Verify SSH Tunnel
curl http://localhost:1234/v1/models

# 2. Verify Server Health
curl http://localhost:3005/api/health

# 3. Verify in Browser
# Open http://YOUR_VM_IP:3005
```

---

## Troubleshooting

### Problem: "LM Studio not responding"
```bash
# Desktop - Check tunnel is running
ps aux | grep "ssh -R"

# If not, restart:
~/lm-studio-tunnel.sh
```

### Problem: "Server Connection Error"
```bash
# VM - Verify tunnel connection
curl http://localhost:1234/v1/models

# If fails, desktop tunnel died:
# Restart on desktop
```

### Problem: "Can't SSH to VM"
```bash
# Check IP is correct
gcloud compute instances list

# Check SSH keys
gcloud compute ssh puneet@INSTANCE_NAME --project=YOUR_PROJECT
```

---

## Next Steps

1. **Get GCP VM IP:**
   ```bash
   gcloud compute instances list
   ```

2. **Run setup script:**
   ```bash
   chmod +x setup-tunnel.sh
   ./setup-tunnel.sh
   ```

3. **Follow QUICK_DEPLOY.md** for step-by-step instructions

4. **Monitor deployment** using DEPLOYMENT_GUIDE.md troubleshooting section

---

## Security Notes

✅ SSH tunnel is encrypted (all traffic goes through SSH)
✅ LM Studio only accessible via local tunnel (not exposed to internet)
✅ .env contains no sensitive data (lm-studio is default key)
✅ Database credentials stored separately in DB environment

---

## Production Checklist

- [ ] SSH tunnel set up and tested
- [ ] GCP VM deployment scripts verified
- [ ] LM Studio model loaded (`google/gemma-3n-e4b`)
- [ ] .env configured correctly
- [ ] Health checks passing
- [ ] App accessible from VM IP
- [ ] Chat responses working
- [ ] No "Connection Error" in UI

---

**🎉 You're ready to deploy with local LM Studio to GCP VM!**

For detailed instructions, see: `QUICK_DEPLOY.md` or `DEPLOYMENT_GUIDE.md`
