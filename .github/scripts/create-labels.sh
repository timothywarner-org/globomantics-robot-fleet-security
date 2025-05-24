#!/bin/bash

# Script to create GitHub labels from labels.yml configuration

echo "Creating GitHub labels for Globomantics training repository..."

# Dependency Management
gh label create "dependencies" --color "0366d6" --description "Pull requests that update a dependency file" --force
gh label create "npm" --color "e99695" --description "npm package updates" --force
gh label create "docker" --color "0db7ed" --description "Docker dependency updates" --force
gh label create "github-actions" --color "000000" --description "GitHub Actions workflow updates" --force

# Security
gh label create "security" --color "d73a4a" --description "Security vulnerability fixes" --force
gh label create "critical-security" --color "b60205" --description "Critical security updates requiring immediate attention" --force

# Automation
gh label create "automated" --color "795548" --description "Automated pull requests from bots" --force
gh label create "auto-merge" --color "2e7d32" --description "Pull requests eligible for automatic merging" --force

# Robot System Components
gh label create "robot-firmware" --color "5319e7" --description "Updates to robot firmware components" --force
gh label create "telemetry" --color "006b75" --description "Telemetry system updates" --force
gh label create "mqtt" --color "1d76db" --description "MQTT messaging system updates" --force
gh label create "maintenance" --color "fbca04" --description "Maintenance system updates" --force

# Priority Levels
gh label create "priority-high" --color "d93f0b" --description "High priority updates" --force
gh label create "priority-medium" --color "f9d71c" --description "Medium priority updates" --force
gh label create "priority-low" --color "c5def5" --description "Low priority updates" --force

# Review Status
gh label create "needs-review" --color "ff7619" --description "Requires manual review before merging" --force
gh label create "approved" --color "0e8a16" --description "Approved and ready to merge" --force

# Update Types
gh label create "major-update" --color "b60205" --description "Major version updates (breaking changes)" --force
gh label create "minor-update" --color "ff9800" --description "Minor version updates (new features)" --force
gh label create "patch-update" --color "4caf50" --description "Patch version updates (bug fixes)" --force

# Training Specific
gh label create "training-exercise" --color "d4c5f9" --description "Part of a training exercise" --force
gh label create "globomantics" --color "7057ff" --description "Globomantics-specific updates" --force

echo "✅ All labels created successfully!"