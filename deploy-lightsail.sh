#!/bin/bash

# Lightsail Deployment Script for Draw Canvas React App
# This script installs Docker and deploys the application on a Lightsail instance

set -e

echo "🚀 Starting Lightsail deployment for Draw Canvas React App..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
echo "📋 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Create application directory
echo "📁 Setting up application directory..."
mkdir -p /home/ubuntu/draw-canvas-app
cd /home/ubuntu/draw-canvas-app

# Copy application files (assuming they're uploaded or cloned)
# If using git, uncomment the following lines:
# git clone <your-repo-url> .
# cd draw-canvas-react

# Set environment variables
echo "🔧 Setting up environment variables..."
cat > .env << EOF
REACT_APP_BACKEND_URL=https://mosida-node-backend-production.up.railway.app
NODE_ENV=production
EOF

# Build and run the application
echo "🏗️ Building and starting the application..."
sudo docker-compose up -d --build

# Wait for the application to start
echo "⏳ Waiting for application to start..."
sleep 30

# Check if the application is running
echo "🔍 Checking application status..."
if curl -f http://localhost:3000/health; then
    echo "✅ Application is running successfully!"
    echo "🌐 Access your application at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"
else
    echo "❌ Application failed to start. Check logs with: docker-compose logs"
    exit 1
fi

# Set up auto-restart on reboot
echo "🔄 Setting up auto-restart on reboot..."

# Create a systemd service for auto-restart
sudo tee /etc/systemd/system/draw-canvas-app.service > /dev/null << EOF
[Unit]
Description=Draw Canvas React App
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/draw-canvas-app
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable draw-canvas-app.service

# Configure firewall (if using UFW)
echo "🔥 Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw --force enable

echo "🎉 Deployment completed successfully!"
echo "📋 Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop app: docker-compose down"
echo "  - Restart app: docker-compose restart"
echo "  - Update app: git pull && docker-compose up -d --build"
echo "  - Check status: sudo systemctl status draw-canvas-app" 