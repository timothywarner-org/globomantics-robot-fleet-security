# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Globomantics Robot Fleet Security - A comprehensive industrial robot fleet management system designed as a demonstration project for GitHub Advanced Security (GHAS) features, specifically for teaching Dependabot and CodeQL concepts.

## Architecture

### Application Structure
- **Main API Server**: `src/index.js` - Express.js API with JWT authentication
- **Legacy Demo App**: `app.js` - Intentionally vulnerable Express app for security demonstrations
- **Database**: MongoDB for data persistence, Redis for caching/sessions
- **Real-time**: Socket.io for telemetry, MQTT for IoT device communication
- **Security**: Role-based access (Admin, Technician, Operator), rate limiting, input validation

### API Routes
All routes prefixed with `/api/v1/`:
- `/auth` - Authentication (login, logout, refresh)
- `/robots` - Robot CRUD operations
- `/maintenance` - Maintenance log management
- `/telemetry` - Real-time robot telemetry
- `/firmware` - Firmware update management
- `/alerts` - Alert system
- `/health` - Service health checks

### Service Ports
- App: 30000 (mapped from 3000)
- MongoDB: 27017
- Redis: 6379
- MQTT: 18830
- MongoDB Express: 8081

## Common Commands

### Development
```bash
npm run dev          # Start with hot reload
npm start            # Production server
npm test             # Run all tests
npm run test:watch   # Tests in watch mode
npm run test:coverage # Generate coverage report
npm run lint         # Check code style
npm run lint:fix     # Auto-fix style issues
```

### Docker Operations
```bash
# Recommended approach
./scripts/run-docker.sh    # Start all services (Linux/WSL2)
docker-compose logs -f app # View application logs
docker-compose down        # Stop everything

# Direct Docker commands
docker-compose up -d       # Start detached
docker-compose ps          # Check service status
```

### Testing Strategy
- Framework: Jest
- Coverage target: 80% (all metrics)
- Test files: Alongside source files or in `tests/`
- Run single test: `npm test -- path/to/test.js`
- Debug tests: `npm test -- --detectOpenHandles`

## Security Features

### Intentional Vulnerabilities
The `app.js` file contains deliberate security issues for educational purposes:
- SQL injection vulnerabilities
- XSS vulnerabilities
- Insecure dependencies

### Security Workflows
- **Pre-commit hooks**: Dependency vulnerability scanning
- **PR Analysis**: Enhanced dependency and CodeQL scanning
- **Dependabot**: Configured for npm, Docker, and GitHub Actions
- **Labels**: Comprehensive labeling system for dependency updates

### Default Credentials
- Username: `admin`
- Password: `Password1!`

## GitHub Integration

### Dependabot Configuration
- Assignee: timothywarner
- Daily npm updates (production only)
- Weekly GitHub Actions and Docker updates
- Grouped updates for patches and dev dependencies

### Repository Labels
Run `./github/scripts/create-labels.sh` to set up labels for:
- Dependency types (npm, docker, github-actions)
- Security levels (security, critical-security)
- Priority levels (high, medium, low)
- Robot system components (firmware, telemetry, mqtt, maintenance)

## Key Directories
- `src/` - Main application source
- `tests/` - Test files and setup
- `docs/` - Advanced security documentation
- `.github/` - GitHub workflows and actions
- `scripts/` - Utility scripts for Docker and setup
- `data/` - Sample data files (robots.json, maintenance-logs.json)