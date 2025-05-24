# Globomantics Robot Fleet Security

A comprehensive security implementation for industrial robot fleet management systems. This repository is a demonstration project for the Pluralsight course "GitHub Advanced Security: Dependency Scanning with Dependabot".

## Purpose

This repository demonstrates real-world implementation of GitHub Advanced Security (GHAS) features with a focus on:

- Dependabot vulnerability alerts and security updates
- CodeQL analysis for JavaScript and Python code
- Enhanced security workflows and automations
- Multi-layered security approach for modern applications

## Running the Application

This repo contains a working Robot Fleet Management application that can be used to demonstrate the security features.

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ and npm 9+ (for local development)

### Quick Start with Docker

The easiest way to run the application is using Docker Compose:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Access the application at http://localhost:30000
# MongoDB Express admin interface at http://localhost:8081
```

#### Running in Windows

We've included idempotent startup scripts that handle cleaning up previous containers and freeing ports:

##### Using WSL2 (Recommended for Windows)

If you're using Windows with WSL2, you can use the Bash script:

```bash
# From WSL2 terminal
./scripts/run-docker.sh
```

##### Using PowerShell

If you prefer PowerShell:

```powershell
# From PowerShell
.\scripts\run-docker.ps1
```

These scripts:
- Stop and remove any existing containers
- Free up required ports that might be in use
- Ensure a clean startup environment
- Provide helpful output and error messages

### Running Locally

If you prefer to run the application without Docker:

1. Install dependencies:
```bash
npm install
```

2. Copy environment configuration:
```bash
cp .env.example .env
```

3. Start the application:
```bash
npm start
```

4. Access the application at http://localhost:3000

### Default Credentials

- Username: `admin`
- Password: `Password1!`

## Port Configuration

The application uses the following ports:

| Service        | Port  | Description                      |
|----------------|-------|----------------------------------|
| Web Application| 30000 | Main web interface               |
| MongoDB        | 27017 | Database                         |
| Redis          | 6379  | Cache and session storage        |
| MQTT           | 18830 | Message broker for IoT devices   |
| MongoDB Express| 8081  | MongoDB admin interface          |

## Security Features

### Dependency Security

This project implements a comprehensive dependency security approach:

1. **Pre-commit Dependency Scanning**
   - Automatically blocks commits with critical or high-severity vulnerabilities
   - Install with: `bash .github/scripts/install-hooks.sh`
   - Learn more: [Advanced Dependency Scanning](docs/advanced-dependency-scanning.md)

2. **Enhanced Dependency Analysis**
   - Automatically runs on PRs that modify dependencies
   - Provides exploitability context from NVD and EPSS
   - Detects actively exploited vulnerabilities with CISA KEV database

3. **Automated Dependabot Alerts Enhancement**
   - Enriches Dependabot alerts with labels and assignments
   - Creates tracking issues for organized remediation
   - Learn more: [Dependabot Alerts Enhancer](docs/dependabot-enhanced-workflow.md)

### Code Scanning Security

Our advanced code scanning integration complements dependency security:

1. **Enhanced CodeQL Analysis**
   - Automatically scans JavaScript and Python code for vulnerabilities
   - Detects insecure dependency usage patterns that may expose vulnerabilities
   - Correlates code patterns with known dependency vulnerabilities
   - Learn more: [Code Scanning Integration](docs/code-scanning-integration.md)

2. **Cross-Language Vulnerability Detection**
   - Identifies security issues that span language boundaries
   - Special focus on packages used in both Node.js and Python environments
   - Detects tainted data flows from one language ecosystem to another

3. **Contextual Severity Assessment**
   - Prioritizes findings based on actual exploitability
   - Automatically elevates severity for actively exploited vulnerabilities
   - Provides detailed remediation guidance with code examples

For security policy and vulnerability reporting, please see [SECURITY.md](SECURITY.md).

### Additional Security Features

- JWT token authentication
- Role-based access control (Admin, Technician, Operator)
- Rate limiting on API endpoints
- Input validation and sanitization
- Secure password hashing with bcrypt
- HTTPS support in production

## Trying the Security Features

To experience the security features in action:

### Pre-commit Dependency Scanning

1. Install the pre-commit hooks:
```bash
bash .github/scripts/install-hooks.sh
```

2. Try making a commit that would introduce a vulnerable dependency (the hook will block it)

### Enhanced Dependency Analysis

1. Create a branch and modify the package.json file to introduce a vulnerable dependency
2. Create a pull request
3. Observe the detailed dependency analysis comment added to the PR

### CodeQL Analysis

1. Create a branch and introduce a code vulnerability (like a SQL injection)
2. Create a pull request
3. Observe how CodeQL detects the issue and correlates it with dependency information

### Viewing Security Reports

The repository contains several example report artifacts from previous workflow runs in the `.github/examples` directory that you can review to understand the output formats.

## About the Pluralsight Course

This repository is used in the Pluralsight course "GitHub Advanced Security: Dependency Scanning with Dependabot" which teaches:

- Setting up and configuring Dependabot in GitHub repositories
- Creating custom workflows to enhance Dependabot alerts
- Implementing pre-commit hooks for early vulnerability detection
- Correlating dependency vulnerabilities with code scanning results
- Building a comprehensive security approach for real-world applications

## License

MIT License - See LICENSE file for details

---

**Created for educational purposes by [Tim Warner](https://github.com/timothywarner-org)**