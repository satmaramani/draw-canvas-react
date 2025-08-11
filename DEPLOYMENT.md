# Draw Canvas React App - Deployment Guide

This guide explains how to deploy the Draw Canvas React App using Docker containers on various cloud platforms.

## 🏗️ Architecture

The application is containerized using:
- **Multi-stage Dockerfile**: Builds the React app and serves it with nginx
- **Nginx**: Production-grade web server with optimized configuration
- **Docker Compose**: For local development and simple deployments
- **Health checks**: Built-in monitoring endpoints

## 📋 Prerequisites

- Docker installed on your machine
- Git for version control
- AWS CLI (for ECS deployment)
- Appropriate cloud platform access

## 🚀 Quick Start (Local Development)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd draw-canvas-react
   ```

2. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d --build
   ```

3. **Access the application**
   - Open http://localhost:3000 in your browser
   - Health check: http://localhost:3000/health

## ☁️ Cloud Deployments

### 1. Amazon EC2 Deployment

#### Option A: Using the deployment script
```bash
# Upload the deployment script to your EC2 instance
chmod +x deploy-ec2.sh
./deploy-ec2.sh
```

#### Option B: Manual deployment
```bash
# Connect to your EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Install Docker
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone and deploy
git clone <your-repo-url>
cd draw-canvas-react
sudo docker-compose up -d --build
```

### 2. AWS Lightsail Deployment

#### Using the deployment script
```bash
# Upload the deployment script to your Lightsail instance
chmod +x deploy-lightsail.sh
./deploy-lightsail.sh
```

#### Manual deployment
```bash
# Connect to your Lightsail instance
ssh -i your-key.pem ubuntu@your-lightsail-ip

# Install Docker
sudo apt-get update
sudo apt-get install -y docker.io docker-compose

# Clone and deploy
git clone <your-repo-url>
cd draw-canvas-react
sudo docker-compose up -d --build
```

### 3. Amazon ECS Deployment

#### Prerequisites
- AWS CLI configured with appropriate permissions
- ECS cluster created
- ECS service created with Application Load Balancer
- ECR repository access

#### Deployment steps
1. **Update configuration**
   ```bash
   # Edit deploy-ecs.sh and update:
   # - AWS_REGION
   # - AWS_ACCOUNT_ID
   # - ECS_CLUSTER
   # - ECS_SERVICE
   ```

2. **Run deployment**
   ```bash
   chmod +x deploy-ecs.sh
   ./deploy-ecs.sh
   ```

#### Manual ECS deployment
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
docker build -t draw-canvas-react .
docker tag draw-canvas-react:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/draw-canvas-react:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/draw-canvas-react:latest

# Update ECS service
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json
aws ecs update-service --cluster your-cluster --service your-service --task-definition draw-canvas-react
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
REACT_APP_BACKEND_URL=https://mosida-node-backend-production.up.railway.app
NODE_ENV=production
```

### Customizing the Backend URL

The application connects to the Python backend for image processing. Update the `REACT_APP_BACKEND_URL` environment variable to point to your backend service.

## 📊 Monitoring and Health Checks

### Health Check Endpoint
- **URL**: `/health`
- **Method**: GET
- **Response**: `healthy` (text/plain)

### Logs
```bash
# Docker Compose
docker-compose logs -f

# ECS
aws logs tail /ecs/draw-canvas-react --follow

# Direct Docker
docker logs <container-id>
```

## 🔒 Security Considerations

### Security Headers
The nginx configuration includes security headers:
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Content-Security-Policy

### SSL/TLS
For production deployments, configure SSL certificates:
1. Obtain SSL certificates
2. Update nginx configuration
3. Configure load balancer (if using ALB)

## 📈 Scaling

### Horizontal Scaling
- **ECS**: Update desired count in service
- **EC2/Lightsail**: Use multiple instances behind a load balancer
- **Docker Compose**: Use `docker-compose up --scale draw-canvas-react=3`

### Vertical Scaling
- **ECS**: Update CPU/memory in task definition
- **EC2/Lightsail**: Use larger instance types

## 🛠️ Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   sudo netstat -tulpn | grep :3000
   # Kill the process or change the port in docker-compose.yml
   ```

2. **Permission denied**
   ```bash
   # Fix Docker permissions
   sudo usermod -aG docker $USER
   # Log out and back in
   ```

3. **Build failures**
   ```bash
   # Clear Docker cache
   docker system prune -a
   # Rebuild without cache
   docker-compose build --no-cache
   ```

4. **Health check failures**
   ```bash
   # Check container logs
   docker logs <container-id>
   # Verify nginx configuration
   docker exec <container-id> nginx -t
   ```

### Performance Optimization

1. **Enable gzip compression** (already configured in nginx.conf)
2. **Use CDN** for static assets
3. **Implement caching strategies**
4. **Monitor resource usage**

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [React Production Build](https://create-react-app.dev/docs/production-build/)

## 🤝 Support

For issues and questions:
1. Check the troubleshooting section
2. Review container logs
3. Verify configuration files
4. Test health check endpoints 