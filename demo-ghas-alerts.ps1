# =====================================================
# 🚨 GHAS Security Alerts Demo Script
# =====================================================
# Author: Tim Warner's AI Assistant 🎸
# Purpose: Trigger GHAS alerts and see them in Slack
# Requirements: PowerShell, GitHub CLI (gh)
# =====================================================

Write-Host "🎸 GHAS Security Alerts Demo Script - Let's Rock!" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# =====================================================
# STEP 1: Environment Check
# =====================================================
Write-Host "`n🔍 STEP 1: Checking Environment..." -ForegroundColor Yellow

# Check if we're in the right directory
$currentPath = Get-Location
Write-Host "📁 Current Directory: $currentPath" -ForegroundColor White

# Check GitHub CLI authentication
Write-Host "🔐 Checking GitHub CLI authentication..." -ForegroundColor White
try {
  $authStatus = gh auth status 2>&1
  if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ GitHub CLI authenticated successfully!" -ForegroundColor Green
  }
  else {
    Write-Host "❌ GitHub CLI not authenticated. Run: gh auth login" -ForegroundColor Red
    exit 1
  }
}
catch {
  Write-Host "❌ GitHub CLI not found. Please install GitHub CLI first." -ForegroundColor Red
  exit 1
}

# Check if we have the right repo
$repoInfo = gh repo view --json nameWithOwner 2>$null | ConvertFrom-Json
if ($repoInfo.nameWithOwner -eq "timothywarner-org/globomantics-robot-fleet-security") {
  Write-Host "✅ Correct repository: $($repoInfo.nameWithOwner)" -ForegroundColor Green
}
else {
  Write-Host "❌ Wrong repository. Navigate to globomantics-robot-fleet-security directory." -ForegroundColor Red
  exit 1
}

# =====================================================
# STEP 2: Check Current Security Status
# =====================================================
Write-Host "`n🔍 STEP 2: Checking Current Security Alerts..." -ForegroundColor Yellow

Write-Host "📦 Checking Dependabot alerts..." -ForegroundColor White
$dependabotAlerts = gh api repos/timothywarner-org/globomantics-robot-fleet-security/dependabot/alerts --jq '.[] | select(.state=="open")' 2>$null
if ($dependabotAlerts) {
  $alertCount = ($dependabotAlerts | ConvertFrom-Json).Count
  Write-Host "⚠️  Found $alertCount open Dependabot alerts" -ForegroundColor Orange
}
else {
  Write-Host "ℹ️  No Dependabot alerts found yet (they take 5-10 minutes after adding vulnerable deps)" -ForegroundColor Cyan
}

Write-Host "🔍 Checking CodeQL alerts..." -ForegroundColor White
$codeqlAlerts = gh api repos/timothywarner-org/globomantics-robot-fleet-security/code-scanning/alerts --jq '.[] | select(.state=="open")' 2>$null
if ($codeqlAlerts) {
  $codeAlertCount = ($codeqlAlerts | ConvertFrom-Json).Count
  Write-Host "⚠️  Found $codeAlertCount open CodeQL alerts" -ForegroundColor Orange
}
else {
  Write-Host "ℹ️  No CodeQL alerts found yet (CodeQL analysis takes 2-5 minutes)" -ForegroundColor Cyan
}

# =====================================================
# STEP 3: Test Slack Integration
# =====================================================
Write-Host "`n🚀 STEP 3: Testing Slack Integration..." -ForegroundColor Yellow

Write-Host "📢 Sending test message to Slack..." -ForegroundColor White
$testMessage = "🎸 GHAS Demo Alert - Testing from Tim's PowerShell script! $(Get-Date -Format 'HH:mm:ss')"

try {
  gh workflow run ghas-slack-notifications.yml --field test_message="$testMessage" --field check_type="all"
  Write-Host "✅ Test workflow triggered successfully!" -ForegroundColor Green
  Write-Host "💬 Check your #ghas-security-alerts channel in Slack!" -ForegroundColor Cyan
}
catch {
  Write-Host "❌ Failed to trigger workflow: $($_.Exception.Message)" -ForegroundColor Red
}

# =====================================================
# STEP 4: Add More Vulnerable Dependencies
# =====================================================
Write-Host "`n💣 STEP 4: Adding More Vulnerable Dependencies..." -ForegroundColor Yellow

Write-Host "📝 Adding additional vulnerable packages to package.json..." -ForegroundColor White

# Read current package.json
$packageJsonPath = "package.json"
$packageJson = Get-Content $packageJsonPath | ConvertFrom-Json

# Add more vulnerable dependencies
$newVulnDeps = @{
  "express"   = "4.16.0"  # Downgrade to vulnerable version
  "lodash"    = "4.4.0"    # Downgrade to vulnerable version
  "moment"    = "2.18.0"   # Downgrade to vulnerable version
  "axios"     = "0.18.0"    # Downgrade to vulnerable version
  "request"   = "2.81.0"  # Add deprecated vulnerable package
  "validator" = "10.8.0" # Downgrade to vulnerable version
}

Write-Host "🔧 Adding/updating vulnerable dependencies:" -ForegroundColor White
foreach ($dep in $newVulnDeps.GetEnumerator()) {
  $packageJson.dependencies.($dep.Key) = $dep.Value
  Write-Host "   • $($dep.Key)@$($dep.Value)" -ForegroundColor Yellow
}

# Save updated package.json
$packageJson | ConvertTo-Json -Depth 10 | Set-Content $packageJsonPath
Write-Host "✅ Updated package.json with vulnerable dependencies" -ForegroundColor Green

# =====================================================
# STEP 5: Add More Vulnerable Code
# =====================================================
Write-Host "`n🐛 STEP 5: Adding More Vulnerable Code Patterns..." -ForegroundColor Yellow

$additionalVulnCode = @"
/**
 * 🚨 ADDITIONAL VULNERABLE CODE - FOR DEMO PURPOSES
 * More security anti-patterns to trigger CodeQL alerts
 */

const fs = require('fs');
const crypto = require('crypto');

// 🚨 Hard-coded credentials in different formats
const secrets = {
    password: 'MySecretPassword123!',
    apiKey: 'AKIA1234567890ABCDEF',
    token: 'ghp_1234567890abcdefghijklmnopqrstuvwxyz',
    connectionString: 'Server=localhost;Database=robots;User=admin;Password=secret123;'
};

// 🚨 Insecure file operations
function readUserFile(filename) {
    // Path traversal vulnerability
    return fs.readFileSync('./uploads/' + filename, 'utf8');
}

// 🚨 Weak random number generation for security
function generatePassword() {
    return Math.random().toString(36).slice(-8);
}

// 🚨 SQL injection with template literals
function searchRobots(userInput) {
    const query = `SELECT * FROM robots WHERE name LIKE '%` + userInput + `%'`;
    return query; // This would be executed unsafely
}

// 🚨 XSS vulnerability in HTML generation
function createUserProfile(userData) {
    return `<div class="profile">
        <h1>Welcome ` + userData.name + `!</h1>
        <p>Email: ` + userData.email + `</p>
    </div>`;
}

// 🚨 Command injection through user input
const { spawn } = require('child_process');
function checkSystemStatus(command) {
    return spawn('sh', ['-c', command]); // Dangerous!
}

// 🚨 Insecure deserialization
function processUserData(jsonData) {
    return eval('(' + jsonData + ')'); // Never use eval!
}

// 🚨 Information disclosure
process.on('uncaughtException', (err) => {
    console.log('Full error details:', err);
    console.log('Environment:', process.env);
    console.log('Stack trace:', err.stack);
});

module.exports = {
    secrets,
    readUserFile,
    generatePassword,
    searchRobots,
    createUserProfile,
    checkSystemStatus,
    processUserData
};
"@

# Add to vulnerable demo file
$additionalVulnCode | Add-Content -Path "src/vulnerable-demo.js"
Write-Host "✅ Added more vulnerable code patterns to src/vulnerable-demo.js" -ForegroundColor Green

# =====================================================
# STEP 6: Commit and Push Changes
# =====================================================
Write-Host "`n📤 STEP 6: Committing and Pushing Changes..." -ForegroundColor Yellow

Write-Host "📝 Staging changes..." -ForegroundColor White
git add -A

$commitMessage = "🚨 Demo: Add more vulnerabilities for GHAS testing

- Downgraded express, lodash, moment, axios to vulnerable versions
- Added request package (deprecated/vulnerable)
- Additional vulnerable code patterns for CodeQL detection
- More hard-coded secrets and injection vulnerabilities

Triggered from PowerShell demo script at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

Write-Host "💾 Committing changes..." -ForegroundColor White
git commit -m "$commitMessage"

Write-Host "🚀 Pushing to GitHub..." -ForegroundColor White
git push origin main

Write-Host "✅ Changes pushed successfully!" -ForegroundColor Green

# =====================================================
# STEP 7: Monitor Results
# =====================================================
Write-Host "`n📊 STEP 7: Monitoring Results..." -ForegroundColor Yellow

Write-Host "⏱️  Waiting 30 seconds for GitHub to process changes..." -ForegroundColor White
Start-Sleep -Seconds 30

Write-Host "🔍 Checking workflow status..." -ForegroundColor White
$recentRuns = gh run list --limit 3 --json status, conclusion, name, createdAt
$runs = $recentRuns | ConvertFrom-Json

foreach ($run in $runs) {
  $status = if ($run.status -eq "completed") { "✅" } elseif ($run.status -eq "in_progress") { "🔄" } else { "⏳" }
  Write-Host "   $status $($run.name) - $($run.status)" -ForegroundColor Cyan
}

# =====================================================
# STEP 8: Expected Results & Next Steps
# =====================================================
Write-Host "`n🎯 STEP 8: What to Expect..." -ForegroundColor Yellow

Write-Host @"
🚀 Your GHAS automation is now running! Here's what should happen:

📢 SLACK NOTIFICATIONS (check #ghas-security-alerts):
   • Test message should appear within 1-2 minutes
   • Real security alerts will appear as they're detected

📦 DEPENDABOT ALERTS (5-15 minutes):
   • express@4.16.0 - Multiple vulnerabilities
   • lodash@4.4.0 - Prototype pollution
   • moment@2.18.0 - ReDoS vulnerabilities
   • axios@0.18.0 - Multiple security issues
   • request@2.81.0 - Deprecated with vulnerabilities

🔍 CODEQL ALERTS (2-10 minutes):
   • Hard-coded secrets detection
   • SQL injection patterns
   • Command injection vulnerabilities
   • XSS vulnerabilities
   • Path traversal issues
   • Insecure deserialization

🔗 USEFUL COMMANDS:
   gh run list --limit 5                    # Check workflow runs
   gh run watch                             # Watch current run
   gh browse --web /security               # Open security tab
   gh api repos/{owner}/{repo}/dependabot/alerts  # Check Dependabot alerts

📱 SLACK CHANNEL: #ghas-security-alerts
"@ -ForegroundColor Cyan

Write-Host "`n🎸 Demo script completed! Check your Slack channel now!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan

# Optional: Open GitHub security tab
$openWeb = Read-Host "`nWould you like to open the GitHub Security tab? (y/N)"
if ($openWeb -eq 'y' -or $openWeb -eq 'Y') {
  gh browse --web /security
}

Write-Host "`n🚀 GHAS automation is LIVE! Rock on! 🤘" -ForegroundColor Magenta
