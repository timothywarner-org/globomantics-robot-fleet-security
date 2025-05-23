# Globomantics Robot Fleet Security

A comprehensive security implementation for industrial robot fleet management systems. This repository is a demonstration project for the Pluralsight course "GitHub Advanced Security: Dependency Scanning with Dependabot".

## Purpose

This repository demonstrates real-world implementation of GitHub Advanced Security (GHAS) features with a focus on:

- Dependabot vulnerability alerts and security updates
- CodeQL analysis for JavaScript and Python code
- Enhanced security workflows and automations
- Multi-layered security approach for modern applications

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