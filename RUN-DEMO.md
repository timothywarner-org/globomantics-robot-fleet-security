# 🎸 GHAS Security Demo - Run Instructions

## **Quick Start (2 commands):**

```powershell
# Navigate to the repo directory
cd "E:\Dropbox\pluralsight\tim-warner (1)\GHAS\05-ghas-compliance\ghas-compliance-m2\globomantics-robot-fleet-security"

# Run the demo script
.\demo-ghas-alerts.ps1
```

## **What This Script Does:**

✅ **Checks your environment** (GitHub CLI, correct repo)
✅ **Tests Slack integration** (sends test message)
✅ **Adds vulnerable dependencies** (triggers Dependabot alerts)
✅ **Adds vulnerable code** (triggers CodeQL alerts)
✅ **Commits & pushes changes** (starts security scans)
✅ **Monitors results** (shows you what's happening)

## **Expected Timeline:**

- **📢 Slack test message**: 1-2 minutes
- **🔍 CodeQL alerts**: 2-10 minutes
- **📦 Dependabot alerts**: 5-15 minutes
- **🚨 Real security notifications**: Start flowing to #ghas-security-alerts

## **What You'll See in Slack:**

```
🚨 GHAS Security Alert - Multiple

🚨 Security Alert: critical Severity

Repository: timothywarner-org/globomantics-robot-fleet-security
Alert Type: Multiple
Severity: critical
Branch: main

🚨 CRITICAL: 5 critical dependency vulnerabilities!

[🔍 View Alert] [📊 View Security Tab]

⏰ Detected at: 2025-01-27T21:15:00Z | 🤖 Powered by GHAS
```

## **Troubleshooting:**

**Script won't run?**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**No Slack messages?**
- Check webhook URL in GitHub secrets
- Verify #ghas-security-alerts channel exists
- Wait a few more minutes

**Ready to rock? Run the script!** 🚀
