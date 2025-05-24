#!/bin/bash
# Script to stop all Docker services for the Globomantics Robot Fleet Demo

# Set the working directory to the repository root
SCRIPT_DIR=$(dirname "$0")
ROOT_DIR=$(realpath "$SCRIPT_DIR/..")
cd "$ROOT_DIR"

# Clear the console
clear
echo "=========================================="
echo "Stopping Globomantics Robot Fleet Demo"
echo "=========================================="
echo ""

echo "Stopping all Docker containers..."
docker-compose down --volumes --remove-orphans

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

echo ""
echo "All services have been stopped and cleaned up."
echo "To restart the application, run:"
echo "  ./scripts/run-docker.sh"
echo "" 