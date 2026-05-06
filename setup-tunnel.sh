#!/bin/bash

# SSH Tunnel Setup Script for GCP VM
# This script creates a persistent SSH tunnel to forward LM Studio access

set -e

echo "🔗 LM Studio SSH Tunnel Setup"
echo "============================="
echo ""

# Configuration
read -p "Enter GCP VM IP address: " VM_IP
read -p "Enter GCP username (default: puneet): " -i "puneet" -e USER
read -p "Enter local LM Studio port (default: 1234): " -i "1234" -e LOCAL_PORT
read -p "Enter remote port on VM (default: 1234): " -i "1234" -e REMOTE_PORT

# Validate IP format
if ! [[ "$VM_IP" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
    echo "❌ Invalid IP address format"
    exit 1
fi

echo ""
echo "Configuration:"
echo "  VM IP: $VM_IP"
echo "  Username: $USER"
echo "  Local Port: $LOCAL_PORT"
echo "  Remote Port: $REMOTE_PORT"
echo ""

# Test SSH connection
echo "🔍 Testing SSH connection..."
if ssh -o ConnectTimeout=5 -o BatchMode=yes ${USER}@${VM_IP} "echo OK" &>/dev/null; then
    echo "✅ SSH connection successful"
else
    echo "❌ Cannot connect to VM. Check IP and username."
    exit 1
fi

# Create tunnel script
TUNNEL_SCRIPT=~/lm-studio-tunnel.sh
cat > "$TUNNEL_SCRIPT" << EOF
#!/bin/bash

VM_IP="${VM_IP}"
USER="${USER}"
LOCAL_PORT="${LOCAL_PORT}"
REMOTE_PORT="${REMOTE_PORT}"

echo "🔗 Starting SSH tunnel..."
echo "   Desktop LM Studio (localhost:${LOCAL_PORT})"
echo "   → GCP VM (localhost:${REMOTE_PORT})"
echo ""
echo "Keep this terminal open!"
echo "Press Ctrl+C to close tunnel"
echo ""

ssh -R ${REMOTE_PORT}:localhost:${LOCAL_PORT} \${USER}@\${VM_IP} -N -v

echo ""
echo "❌ Tunnel closed"
echo "   Reconnecting in 10 seconds..."
sleep 10
exec \$0
EOF

chmod +x "$TUNNEL_SCRIPT"

echo "✅ Script created: $TUNNEL_SCRIPT"
echo ""
echo "Next steps:"
echo ""
echo "1️⃣  Start the tunnel:"
echo "   $TUNNEL_SCRIPT"
echo ""
echo "2️⃣  In another terminal, SSH to GCP VM:"
echo "   ssh ${USER}@${VM_IP}"
echo ""
echo "3️⃣  On the VM, verify tunnel:"
echo "   curl http://localhost:${REMOTE_PORT}/v1/models"
echo ""
echo "4️⃣  Start the server on VM:"
echo "   npm run dev"
echo ""
echo "🎯 Then access the app at: http://${VM_IP}:3005"
echo ""
