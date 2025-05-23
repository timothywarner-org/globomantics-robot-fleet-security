#!/bin/bash
#
# Script to install git hooks
# This installs the pre-commit hook for dependency scanning

# Color codes for better visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Installing Git hooks...${NC}"

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Go up one level to .github
GITHUB_DIR="$(dirname "$SCRIPT_DIR")"
# Go up one more level to the repository root
REPO_ROOT="$(dirname "$GITHUB_DIR")"
# Path to the hooks directory in the repository
HOOK_DIR="$GITHUB_DIR/hooks"
# Path to Git hooks directory
GIT_HOOKS_DIR="$REPO_ROOT/.git/hooks"

# Check if the Git hooks directory exists
if [ ! -d "$GIT_HOOKS_DIR" ]; then
  echo -e "${RED}Error: Git hooks directory not found at $GIT_HOOKS_DIR${NC}"
  echo -e "${RED}Are you running this script from the repository root?${NC}"
  exit 1
fi

# Check if our hooks directory exists
if [ ! -d "$HOOK_DIR" ]; then
  echo -e "${RED}Error: Hooks directory not found at $HOOK_DIR${NC}"
  exit 1
fi

# Install the pre-commit hook
cp "$HOOK_DIR/pre-commit" "$GIT_HOOKS_DIR/pre-commit"
chmod +x "$GIT_HOOKS_DIR/pre-commit"

echo -e "${GREEN}Successfully installed pre-commit hook for dependency scanning.${NC}"
echo -e "${BLUE}The hook will check for vulnerabilities in dependencies before each commit.${NC}"
echo -e "${BLUE}You can bypass the check with FORCE_COMMIT=1 git commit -m \"your message\"${NC}"

exit 0 