#!/bin/bash

# Ensure exactly two arguments are provided
if [ $# -ne 2 ]; then
    echo "Correct usage is: $0 [minikube|docker] [all|postgres|minio|frontend|backend]"
    exit 1
fi

ENV=$1
TARGET=$2

# Set up environment if using minikube
if [ "$ENV" == "minikube" ]; then
    eval $(minikube docker-env)
fi

# Define image build commands (adjust paths and Dockerfiles as necessary)
build_postgres() {
    echo "Building Postgres image..."
    docker build -t postgres-blog -f ../backend-gin/deployments/postgres_db/Dockerfile ../backend-gin/deployments/postgres_db
}

build_minio() {
    echo "Building MinIO image..."
    # Assuming a Dockerfile for MinIO exists at ../minio/Dockerfile
    # docker build -t minio-service -f ../minio/Dockerfile ../minio
}

build_frontend() {
    echo "Building Frontend image..."
    # Assuming a Dockerfile for frontend exists at ../frontend/Dockerfile
    docker build -t astro-app -f ../frontend/Dockerfile ../frontend
}

build_backend() {
    echo "Building Backend image..."
    # Assuming a Dockerfile for Gin backend exists at ../backend-gin/Dockerfile
    docker build -t gin-backend -f ../backend-gin/Dockerfile ../backend-gin
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