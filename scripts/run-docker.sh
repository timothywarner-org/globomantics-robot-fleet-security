#!/bin/bash
# Script to run the application in Docker using WSL2
# This helps ensure the right environment is used

# Set the working directory to the repository root
SCRIPT_DIR=$(dirname "$0")
ROOT_DIR=$(realpath "$SCRIPT_DIR/..")
cd "$ROOT_DIR"

# Clear the console
clear
echo "=========================================="
echo "Globomantics Robot Fleet Security Demo"
echo "=========================================="
echo ""

# Define required ports
APP_PORT=30000
MONGO_PORT=27017
REDIS_PORT=6379
MQTT_PORT=18830
MONGO_EXPRESS_PORT=8081

# Function to cleanup Docker resources
cleanup_docker() {
  echo "Stopping any existing Docker containers for this project..."
  docker-compose down --remove-orphans
  
  # Remove any containers with the project name prefix
  CONTAINERS=$(docker ps -a --filter "name=globomantics-" -q)
  if [ ! -z "$CONTAINERS" ]; then
    echo "Removing orphaned containers..."
    docker rm -f $CONTAINERS 2>/dev/null || true
  fi
  
  # Remove project-specific networks
  NETWORKS=$(docker network ls --filter "name=dependabot-practice" -q)
  if [ ! -z "$NETWORKS" ]; then
    echo "Removing project networks..."
    docker network rm $NETWORKS 2>/dev/null || true
  fi
  
  echo "Docker cleanup completed."
}

# Function to check and free ports if they're in use
free_ports() {
  echo "Checking for processes using required ports..."
  
  for PORT in $APP_PORT $MONGO_PORT $REDIS_PORT $MQTT_PORT $MONGO_EXPRESS_PORT; do
    # Check if port is in use (using ss instead of netstat)
    if command -v ss &> /dev/null; then
      PROCESS=$(ss -tulpn | grep ":$PORT" | awk '{print $7}' | cut -d"=" -f2 | cut -d"," -f1)
    elif command -v lsof &> /dev/null; then
      PROCESS=$(lsof -i :$PORT -t)
    else
      echo "Neither ss nor lsof commands available. Skipping port check for port $PORT."
      continue
    fi
    
    if [ ! -z "$PROCESS" ]; then
      echo "Found process using port $PORT: $PROCESS"
      echo "Attempting to free port $PORT..."
      kill -9 $PROCESS 2>/dev/null || true
      sleep 1
    fi
  done
  
  echo "Port check completed."
}

# Main execution
echo "Preparing environment..."
cleanup_docker
free_ports

echo "Starting Globomantics Robot Fleet Security demo..."
echo "Using Docker Compose from WSL2"

# Run Docker Compose to start all services
echo "Starting services with Docker Compose..."
docker-compose up -d

# Check if services started successfully
if [ $? -eq 0 ]; then
  echo ""
  echo "Services are now running:"
  echo "- Application: http://localhost:$APP_PORT"
  echo "- MongoDB Express: http://localhost:$MONGO_EXPRESS_PORT"
  echo ""
  echo "Default login credentials:"
  echo "- Username: admin"
  echo "- Password: Password1!"
  echo ""
  echo "To view logs:"
  echo "  docker-compose logs -f app"
  echo ""
  echo "To stop all services:"
  echo "  docker-compose down"
  echo ""
  echo "If you encounter any issues, run this script again to restart with a clean environment."
else
  echo ""
  echo "ERROR: Failed to start services. See error messages above."
  echo "You may try running again with:"
  echo "  ./scripts/run-docker.sh"
  echo ""
fi 