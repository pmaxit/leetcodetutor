# 🚀 Quick Deployment Reference

## 1️⃣ Desktop Setup (One Time)

```bash
# Make setup script executable
chmod +x setup-tunnel.sh

# Run interactive setup
./setup-tunnel.sh
```

This creates `~/lm-studio-tunnel.sh` - your tunnel manager.

---

## 2️⃣ Start SSH Tunnel (Every Session)

```bash
# In Desktop Terminal 1:
~/lm-studio-tunnel.sh

# This will:
# - Establish SSH connection to GCP VM
# - Forward port 1234 from your local LM Studio to VM
# - Automatically reconnect if tunnel drops
# Keep this running!
```

---

## 3️⃣ Deploy to GCP VM

```bash
# In Desktop Terminal 2:
ssh USER@VM_IP

# Now on GCP VM:
cd interview-platform
./deploy-on-vm.sh

# This will:
# - Clone or update repo
# - Install dependencies
# - Create .env with correct settings
# - Test LM Studio connection
# - Verify server health
```

---

## 4️⃣ Start Server on VM

```bash
# On GCP VM (after deploy-on-vm.sh completes):
npm run dev

# Server runs on http://0.0.0.0:3005
# Access from: http://GCP_VM_IP:3005
```

---

## 🔍 Troubleshooting Checklist

### Before You Start
- [ ] LM Studio running on desktop: `lms status`
- [ ] Model loaded: `lms status` (should show `google/gemma-3n-e4b`)
- [ ] GCP VM IP address available
- [ ] SSH key configured or password auth enabled

### During Deployment
- [ ] SSH tunnel active (Terminal 1 still running): `ps aux | grep ssh`
- [ ] Test tunnel: `ssh VM_IP "curl localhost:1234/v1/models"`
- [ ] Server started: `npm run dev` on VM
- [ ] No errors in logs

### After Deployment
- [ ] Health check: `curl http://VM_IP:3005/api/health`
- [ ] App loads: Open `http://VM_IP:3005` in browser
- [ ] Chat works: Select a problem and send a message
- [ ] No "Connection Error" in UI

---

## 🛠️ Manual SSH Tunnel (Alternative)

If you don't want to use the setup script:

```bash
# Desktop Terminal 1
ssh -R 1234:localhost:1234 puneet@34.123.45.67 -N

# Keep it open, open new terminal for other commands
```

---

## 📊 Monitoring

### Check tunnel status
```bash
# Desktop
ps aux | grep "ssh -R"
```

### Check server status on VM
```bash
# On VM
curl http://localhost:3005/api/health | jq .

# Should return:
# {
#   "status": "healthy",
#   "llmstudio": "connected",
#   "models": ["google/gemma-3n-e4b", ...]
# }
```

### View server logs
```bash
# On VM
tail -f server.log  # if redirected
# or in npm terminal (Ctrl+C to stop)
npm run dev
```

---

## 🔐 For Production

1. **Use persistent tunnel** - Keep it running on desktop
2. **Use PM2** on VM for process management:
   ```bash
   npm install -g pm2
   pm2 start "npm run dev" --name interview-platform
   ```
3. **Use nginx** as reverse proxy
4. **Enable HTTPS** with SSL certificate
5. **Monitor** tunnel health regularly

---

## 📱 Accessing from Phone/Other Devices

Once deployed:

```
http://GCP_VM_IP:3005
```

Example: `http://34.123.45.67:3005`

---

## ⚡ Quick Command Reference

| Task | Command |
|------|---------|
| Start tunnel | `~/lm-studio-tunnel.sh` |
| SSH to VM | `ssh puneet@34.123.45.67` |
| Deploy on VM | `./deploy-on-vm.sh` |
| Start server | `npm run dev` |
| Check health | `curl http://localhost:3005/api/health` |
| Check tunnel | `ps aux \| grep "ssh -R"` |
| View logs | `tail -f server.log` |
| Kill tunnel | `Ctrl+C` (restart automatically) |
| Stop server | `Ctrl+C` in npm terminal |

---

## 📞 Support

If something goes wrong:

1. **Check tunnel**: `ps aux | grep ssh -R`
2. **Check LM Studio**: `lms status`
3. **Check server**: `npm run dev` in new terminal
4. **View logs**: `tail -f /tmp/server.log` on VM
5. **Check health**: `curl http://localhost:3005/api/health`

---

**🎯 You're all set! Deploy and enjoy!**
