# Dependabot Alerts Enhancer Workflow

This document explains how our Dependabot Alerts Enhancer workflow improves vulnerability management by automatically categorizing, assigning, and tracking security issues.

## Overview

The Dependabot Alerts Enhancer workflow automatically:

1. **Categorizes alerts** by severity and ecosystem
2. **Assigns alerts** to the appropriate teams
3. **Creates tracking issues** with clear action items
4. **Prioritizes critical vulnerabilities** with escalation paths

This workflow helps demonstrate best practices for Dependabot integration in GitHub's security ecosystem.

## How It Works

![Dependabot Alerts Workflow](../public/images/dependabot-flow.png)

Our solution works through three possible trigger methods:

1. **Scheduled Checking**: Daily scans for new alerts 
2. **Webhook Integration**: External service that receives alerts and triggers workflow
3. **Manual Processing**: On-demand processing for specific alerts

Each method feeds into the same core process:

1. The workflow fetches detailed information about the alert using GitHub API
2. Based on severity and ecosystem, it:
   - Creates appropriate labels if they don't exist
   - Creates a tracking issue with actionable steps
   - Assigns the issue to the responsible team
   - Escalates critical and high vulnerabilities

## Benefits for Your Organization

- **Reduced Mean Time to Remediation (MTTR)** - Clear ownership and prioritization
- **Improved Visibility** - Tracking issues in addition to security tab alerts
- **Team Accountability** - Automatic assignment based on technology
- **Process Standardization** - Consistent handling of all security alerts
- **Audit Trail** - Complete history of vulnerability management

## Setup Requirements

### GitHub Actions Workflow Setup

1. Create a GitHub App with the necessary permissions:
   - Repository permissions:
     - Issues: Read & Write
     - Security events: Read
     - Pull requests: Read & Write
     - Contents: Read

2. Store the App's credentials as secrets:
   - `AUTOMATION_APP_ID`
   - `AUTOMATION_PRIVATE_KEY`

3. Modify the team assignments in the workflow to match your organization's structure

### Webhook Handler Setup (Optional)

For real-time alert processing, deploy the webhook handler:

1. Deploy the webhook handler script (`.github/scripts/dependabot-webhook-handler.js`) to a service like:
   - Azure Functions
   - AWS Lambda
   - Heroku
   - Vercel

2. Set the following environment variables:
   - `WEBHOOK_SECRET`: A secret for GitHub to sign webhook payloads 
   - `GITHUB_APP_ID`: Your GitHub App ID
   - `GITHUB_PRIVATE_KEY`: Your GitHub App private key
   - `GITHUB_INSTALLATION_ID`: Installation ID for your GitHub App
   - `TARGET_REPOSITORY`: Repository in format `owner/repo-name`

3. Configure a GitHub webhook in your organization settings:
   - Payload URL: Your deployed service URL
   - Content type: `application/json`
   - Secret: Same as your `WEBHOOK_SECRET`
   - Events: Select custom events (Dependabot alerts)

## Multiple Alert Processing Options

This solution provides several ways to process Dependabot alerts:

### 1. Scheduled Daily Scans

The workflow automatically runs on a schedule to check for new alerts:

```yaml
schedule:
  # Run daily at 8 AM UTC
  - cron: '0 8 * * *'
```

This ensures all alerts get processed even without manual intervention.

### 2. Real-time Processing via Webhook

For immediate processing when alerts are created:

1. The webhook handler receives Dependabot alert notifications
2. It triggers a `repository_dispatch` event with alert details
3. The workflow processes the alert in real-time

### 3. Manual Processing

You can manually process any alert:

1. Go to GitHub Actions
2. Select "Dependabot Alerts Enhancer" workflow
3. Click "Run workflow"
4. Enter the alert number to process

## Example: Alert Processing

When a critical vulnerability is found in an npm package:

1. The alert gets labeled with:
   - `severity:critical` (red)
   - `ecosystem:npm` (blue)
   - `security`
   - `dependabot`
   - `dependabot-alert:123` (tracking ID)

2. An issue is created with details:
   - Title: "Security Alert: critical severity in package-name (npm)"
   - Body: Package details, severity, link to alert
   - Checklist of required actions

3. The issue is assigned to `@javascript-team`

4. A warning is posted about the critical severity

## Integration with Other Security Practices

This workflow complements other security practices:

- **Dependabot Version Updates** - For proactive dependency management
- **CodeQL Analysis** - For deeper code scanning
- **Secret Scanning** - To prevent credential leaks
- **Security Policies** - Formal process documentation

## GitHub Actions for Securing Workflows

This solution also demonstrates best practices for securing GitHub Actions:

1. **Dependabot Monitoring for Actions**
   - Monitoring actions in your workflows for vulnerabilities
   - Automatically updating actions to secure versions

2. **Keeping Actions Up to Date**
   - Using Dependabot version updates for actions
   - Using semantic versioning for actions (not SHA pinning)

3. **Using GitHub Security Features**
   - Implementing proper permissions model
   - Using secrets securely

## Learning More

For more details on GitHub's security features:

- [About Dependabot alerts](https://docs.github.com/en/code-security/dependabot/dependabot-alerts/about-dependabot-alerts)
- [Using GitHub's security features](https://docs.github.com/en/actions/security-guides/using-githubs-security-features-to-secure-your-use-of-github-actions)
- [GitHub Advanced Security documentation](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security) 