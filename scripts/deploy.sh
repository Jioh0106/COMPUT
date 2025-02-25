#!/bin/bash

# Variables
DOCKER_HUB_USERNAME=jioh0106
IMAGE_NAME=tomcat10

# Change to the directory containing docker-compose.yml (if using docker-compose)
cd /home/ec2-user/deployment

# Pull the latest image from Docker Hub
docker pull $DOCKER_HUB_USERNAME/$IMAGE_NAME:latest

# Stop the running container (if any)
docker stop tomcat10 || true
docker rm tomcat10 || true

# Run the new container
docker run -d --name tomcat10 -p 2222:22 -p 8080:8080 $DOCKER_HUB_USERNAME/$IMAGE_NAME:latest

# Remove unused Docker images(사용하지 않는 이미지 삭제)
docker image prune -a -f