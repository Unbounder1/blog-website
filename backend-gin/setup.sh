#!/bin/bash

# Define the base project name
PROJECT_NAME="myapp"

# Create base directory
mkdir -p $PROJECT_NAME

# Define all directories to create
DIRS=(
  "$PROJECT_NAME/cmd/$PROJECT_NAME"
  "$PROJECT_NAME/internal/app"
  "$PROJECT_NAME/internal/handlers"
  "$PROJECT_NAME/internal/models"
  "$PROJECT_NAME/internal/repository"
  "$PROJECT_NAME/internal/service"
  "$PROJECT_NAME/internal/config"
  "$PROJECT_NAME/pkg/utils"
  "$PROJECT_NAME/api"
  "$PROJECT_NAME/migrations"
  "$PROJECT_NAME/scripts"
  "$PROJECT_NAME/deployments/kubernetes"
  "$PROJECT_NAME/deployments/helm/$PROJECT_NAME-chart"
  "$PROJECT_NAME/test"
  "$PROJECT_NAME/web/static/css"
  "$PROJECT_NAME/web/static/js"
  "$PROJECT_NAME/web/static/images"
)

# Create directories
for DIR in "${DIRS[@]}"; do
  mkdir -p "$DIR"
done

echo "Directories created successfully."

# Create placeholder files
FILES=(
  "$PROJECT_NAME/cmd/$PROJECT_NAME/main.go"
  "$PROJECT_NAME/internal/app/app.go"
  "$PROJECT_NAME/internal/handlers/user.go"
  "$PROJECT_NAME/internal/models/user.go"
  "$PROJECT_NAME/internal/repository/user_repo.go"
  "$PROJECT_NAME/internal/service/user_service.go"
  "$PROJECT_NAME/internal/config/config.go"
  "$PROJECT_NAME/pkg/utils/logger.go"
  "$PROJECT_NAME/api/openapi.yaml"
  "$PROJECT_NAME/api/routes.go"
  "$PROJECT_NAME/migrations/0001_create_users_table.up.sql"
  "$PROJECT_NAME/scripts/build.sh"
  "$PROJECT_NAME/deployments/kubernetes/deployment.yaml"
  "$PROJECT_NAME/deployments/kubernetes/service.yaml"
  "$PROJECT_NAME/deployments/kubernetes/ingress.yaml"
  "$PROJECT_NAME/deployments/helm/$PROJECT_NAME-chart/Chart.yaml"
  "$PROJECT_NAME/deployments/helm/$PROJECT_NAME-chart/values.yaml"
  "$PROJECT_NAME/test/user_test.go"
  "$PROJECT_NAME/.gitignore"
  "$PROJECT_NAME/go.mod"
  "$PROJECT_NAME/go.sum"
  "$PROJECT_NAME/Makefile"
  "$PROJECT_NAME/README.md"
  "$PROJECT_NAME/LICENSE"
)

# Create files
for FILE in "${FILES[@]}"; do
  touch "$FILE"
done

echo "Placeholder files created successfully."

# Initialize Go module
cd $PROJECT_NAME
go mod init github.com/username/$PROJECT_NAME

echo "Golang module initialized."

# Make scripts executable
chmod +x "$PROJECT_NAME/scripts/build.sh"

echo "Setup complete!"