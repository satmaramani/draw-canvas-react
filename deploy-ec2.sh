#!/bin/bash

# EC2 Deployment Script for Draw Canvas React App
# This script installs Docker and deploys the application on an EC2 instance

set -e

echo "🚀 Starting EC2 deployment for Draw Canvas React App..."

# Update system packages
echo "📦 Updating system packages..."
sudo yum update -y

# Install Docker
echo "🐳 Installing Docker..."
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
echo "📋 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
echo "📁 Setting up application directory..."
mkdir -p /home/ec2-user/draw-canvas-app
cd /home/ec2-user/draw-canvas-app

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
sudo systemctl enable docker

# Create a systemd service for auto-restart
sudo tee /etc/systemd/system/draw-canvas-app.service > /dev/null << EOF
[Unit]
Description=Draw Canvas React App
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ec2-user/draw-canvas-app
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable draw-canvas-app.service

echo "🎉 Deployment completed successfully!"
echo "📋 Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop app: docker-compose down"
echo "  - Restart app: docker-compose restart"
echo "  - Update app: git pull && docker-compose up -d --build" 