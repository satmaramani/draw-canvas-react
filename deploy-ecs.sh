#!/bin/bash

# ECS Deployment Script for Draw Canvas React App
# This script builds the Docker image, pushes it to ECR, and deploys to ECS

set -e

# Configuration - Update these variables
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="YOUR_ACCOUNT_ID"
ECR_REPOSITORY="draw-canvas-react"
ECS_CLUSTER="draw-canvas-cluster"
ECS_SERVICE="draw-canvas-service"
ECS_TASK_DEFINITION="draw-canvas-react"

echo "🚀 Starting ECS deployment for Draw Canvas React App..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Login to ECR
echo "🔐 Logging in to Amazon ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Create ECR repository if it doesn't exist
echo "📦 Creating ECR repository if it doesn't exist..."
aws ecr describe-repositories --repository-names $ECR_REPOSITORY --region $AWS_REGION || \
aws ecr create-repository --repository-name $ECR_REPOSITORY --region $AWS_REGION

# Build Docker image
echo "🏗️ Building Docker image..."
docker build -t $ECR_REPOSITORY .

# Tag the image
echo "🏷️ Tagging Docker image..."
docker tag $ECR_REPOSITORY:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest

# Push the image to ECR
echo "📤 Pushing Docker image to ECR..."
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest

# Update the task definition with the new image
echo "📋 Updating ECS task definition..."
sed -i "s/YOUR_ACCOUNT_ID/$AWS_ACCOUNT_ID/g" ecs-task-definition.json
sed -i "s/YOUR_REGION/$AWS_REGION/g" ecs-task-definition.json

# Register new task definition
echo "📝 Registering new task definition..."
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json --region $AWS_REGION

# Get the latest task definition revision
TASK_DEFINITION_REVISION=$(aws ecs describe-task-definition --task-definition $ECS_TASK_DEFINITION --region $AWS_REGION --query 'taskDefinition.revision' --output text)

echo "🔄 Updating ECS service..."
aws ecs update-service \
    --cluster $ECS_CLUSTER \
    --service $ECS_SERVICE \
    --task-definition $ECS_TASK_DEFINITION:$TASK_DEFINITION_REVISION \
    --region $AWS_REGION

# Wait for the service to stabilize
echo "⏳ Waiting for service to stabilize..."
aws ecs wait services-stable \
    --cluster $ECS_CLUSTER \
    --services $ECS_SERVICE \
    --region $AWS_REGION

echo "🎉 ECS deployment completed successfully!"
echo "📋 Service URL: http://YOUR_ALB_DNS_NAME"
echo "📋 Useful commands:"
echo "  - View service logs: aws logs tail /ecs/draw-canvas-react --follow"
echo "  - Check service status: aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE --region $AWS_REGION"
echo "  - Scale service: aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE --desired-count 2 --region $AWS_REGION" 