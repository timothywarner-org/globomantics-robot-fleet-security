# 🚀 GHAS-to-Slack Setup Guide

## **Quick Setup for Your Tech Trainer Tim Slack Workspace**

### **Step 1: Create Slack Webhook**

1. **Go to Your Slack Workspace**: [Tech Trainer Tim Slack](https://your-workspace.slack.com)

2. **Create Incoming Webhook**:
   ```bash
   # Navigate to: https://api.slack.com/apps
   # Click "Create New App" -> "From scratch"
   # App Name: "GHAS Security Alerts"
   # Workspace: Select your Tech Trainer Tim workspace
   ```

3. **Configure Webhook**:
   - Go to **Incoming Webhooks** in the sidebar
   - Toggle **Activate Incoming Webhooks** to **On**
   - Click **Add New Webhook to Workspace**
   - Choose your **#security** or **#alerts** channel
   - Copy the webhook URL (starts with `https://hooks.slack.com/services/...`)

### **Step 2: Add Secret to GitHub**

```bash
# Using GitHub CLI (you're already authenticated!)
gh secret set SLACK_WEBHOOK_URL --body "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
```

Or via GitHub UI:
1. Go to: `https://github.com/timothywarner-org/globomantics-robot-fleet-security/settings/secrets/actions`
2. Click **New repository secret**
3. Name: `SLACK_WEBHOOK_URL`
4. Value: Your webhook URL

### **Step 3: Test the Integration**

```bash
# Manual test trigger
gh workflow run ghas-slack-notifications.yml \
  --field test_message="🎸 GHAS-to-Slack is LIVE! Testing from Tim's machine" \
  --field check_type="all"
```

### **Step 4: Watch the Magic** ✨

The workflow will now:
- ✅ **Scan for vulnerabilities** every 6 hours
- ✅ **Send alerts to Slack** when found
- ✅ **Include severity levels** with color coding
- ✅ **Provide direct links** to alerts and security dashboard

## **Expected Results**

With the vulnerable code we just added, you should see:

### **Dependabot Alerts** 📦
- `debug@2.6.0` - ReDoS vulnerability
- `minimist@1.2.0` - Prototype pollution
- `marked@0.3.6` - XSS vulnerabilities
- `serialize-javascript@1.4.0` - Code injection
- `handlebars@4.0.10` - Template injection
- `bootstrap@3.3.7` - XSS vulnerabilities
- `jquery@2.1.4` - XSS vulnerabilities

### **CodeQL Alerts** 🔍
- SQL injection patterns
- Command injection vulnerabilities
- Path traversal issues
- XSS vulnerabilities
- Hard-coded secrets
- Weak cryptography usage
- Insecure deserialization

## **Slack Message Preview**

```
🚨 GHAS Security Alert - Multiple

🚨 Security Alert: critical Severity

Repository: timothywarner-org/globomantics-robot-fleet-security
Alert Type: Multiple
Severity: critical
Branch: main

🚨 CRITICAL: 3 critical dependency vulnerabilities!

[🔍 View Alert] [📊 View Security Tab]

⏰ Detected at: 2025-01-27T20:22:00Z | 🤖 Powered by GHAS
```

## **Next Steps**

1. **Run the test command** to verify Slack integration
2. **Push the vulnerable code** to trigger real alerts
3. **Watch your Slack channel** light up with security notifications
4. **Demo the remediation workflow** by fixing vulnerabilities

**Ready to rock the security automation demo!** 🎸🚀
