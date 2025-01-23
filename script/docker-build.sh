#!/bin/bash

# Ensure exactly two arguments are provided
if [ $# -ne 2 ]; then
    echo "Correct usage is: $0 [minikube|<registry-url>] [all|postgres|minio|frontend|backend]"
    exit 1
fi

ENV=$1
TARGET=$2

# Variables for Docker tag
DOCKER_TAG="latest"

# Set up environment for Minikube or assign registry URL
if [ "$ENV" == "minikube" ]; then
    echo "Configuring environment for Minikube..."
    eval $(minikube docker-env)
    PUSH_TO="localhost:5000"
else
    echo "Using remote Docker registry: $ENV"
    PUSH_TO="$ENV"
fi

# Define image build, tag, and push commands
build_postgres() {
    echo "Building Postgres image..."
    docker build -t postgres-blog:${DOCKER_TAG} -f ../backend-gin/deployments/postgres_db/Dockerfile ../backend-gin/deployments/postgres_db

    echo "Tagging Postgres image for $PUSH_TO..."
    docker tag postgres-blog:${DOCKER_TAG} ${PUSH_TO}/postgres-blog:${DOCKER_TAG}

    echo "Pushing Postgres image to $PUSH_TO..."
    docker push ${PUSH_TO}/postgres-blog:${DOCKER_TAG}
}

build_minio() {
    echo "Building MinIO image..."
    docker build -t minio-service:${DOCKER_TAG} -f ../minio/Dockerfile ../minio

    echo "Tagging MinIO image for $PUSH_TO..."
    docker tag minio-service:${DOCKER_TAG} ${PUSH_TO}/minio-service:${DOCKER_TAG}

    echo "Pushing MinIO image to $PUSH_TO..."
    docker push ${PUSH_TO}/minio-service:${DOCKER_TAG}
}

build_frontend() {
    echo "Building Frontend image..."
    docker build -t astro-app:${DOCKER_TAG} -f ../frontend/Dockerfile ../frontend

    echo "Tagging Frontend image for $PUSH_TO..."
    docker tag astro-app:${DOCKER_TAG} ${PUSH_TO}/astro-app:${DOCKER_TAG}

    echo "Pushing Frontend image to $PUSH_TO..."
    docker push ${PUSH_TO}/astro-app:${DOCKER_TAG}
}

build_backend() {
    echo "Building Backend image..."
    docker build -t gin-backend:${DOCKER_TAG} -f ../backend-gin/Dockerfile ../backend-gin

    echo "Tagging Backend image for $PUSH_TO..."
    docker tag gin-backend:${DOCKER_TAG} ${PUSH_TO}/gin-backend:${DOCKER_TAG}

    echo "Pushing Backend image to $PUSH_TO..."
    docker push ${PUSH_TO}/gin-backend:${DOCKER_TAG}
}

# Execute builds based on the target argument
case "$TARGET" in
    all)
        build_postgres
        build_minio
        build_frontend
        build_backend
        ;;
    postgres)
        build_postgres
        ;;
    minio)
        build_minio
        ;;
    frontend)
        build_frontend
        ;;
    backend)
        build_backend
        ;;
    *)
        echo "Unknown target: $TARGET"
        echo "Valid targets are: all, postgres, minio, frontend, backend"
        exit 1
        ;;
esac

echo "Build process completed."