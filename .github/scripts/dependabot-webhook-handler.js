#!/usr/bin/env node

/**
 * Dependabot Alerts Webhook Handler
 * 
 * This script can be deployed as a service to receive Dependabot alerts and
 * trigger the GitHub Actions workflow via repository_dispatch events.
 * 
 * It's designed to bridge the gap since GitHub doesn't natively support
 * webhook events for Dependabot alerts yet.
 */

const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

// Environment variables
const PORT = process.env.PORT || 3000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const GITHUB_APP_ID = process.env.GITHUB_APP_ID;
const GITHUB_PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, '\n');
const GITHUB_INSTALLATION_ID = process.env.GITHUB_INSTALLATION_ID;

// GitHub App authentication
async function getGitHubAppToken() {
  // Create JWT for GitHub App authentication
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now - 60,
    exp: now + (10 * 60),
    iss: GITHUB_APP_ID
  };

  const jwt = crypto.createSign('RSA-SHA256')
    .update(JSON.stringify({
      alg: 'RS256',
      typ: 'JWT'
    }) + '.' + Buffer.from(JSON.stringify(payload)).toString('base64url'))
    .sign(GITHUB_PRIVATE_KEY, 'base64url');

  // Get installation token
  const response = await axios.post(
    `https://api.github.com/app/installations/${GITHUB_INSTALLATION_ID}/access_tokens`,
    {},
    {
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  );

  return response.data.token;
}

// Verify webhook signature
function verifyWebhookSignature(signature, payload) {
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

// Webhook endpoint for Dependabot alerts
app.post('/dependabot-webhook', async (req, res) => {
  try {
    // Verify signature from GitHub
    const signature = req.headers['x-hub-signature-256'];
    if (!signature || !verifyWebhookSignature(signature, JSON.stringify(req.body))) {
      console.error('Invalid signature');
      return res.status(403).send('Invalid signature');
    }

    // Parse the alert data
    const { alert } = req.body;
    if (!alert || !alert.number) {
      console.error('Invalid alert format');
      return res.status(400).send('Invalid alert format');
    }

    console.log(`Received alert #${alert.number} for ${alert.dependency?.package?.name || 'unknown package'}`);

    // Get repository information
    const repoName = req.headers['x-github-repository'] || process.env.TARGET_REPOSITORY;
    if (!repoName) {
      console.error('Repository not specified');
      return res.status(400).send('Repository not specified');
    }

    // Get GitHub token
    const token = await getGitHubAppToken();

    // Trigger repository_dispatch event
    await axios.post(
      `https://api.github.com/repos/${repoName}/dispatches`,
      {
        event_type: 'dependabot-alert',
        client_payload: {
          alert_number: alert.number,
          package_name: alert.dependency?.package?.name,
          ecosystem: alert.dependency?.package?.ecosystem,
          severity: alert.severity
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    );

    console.log(`Triggered repository_dispatch for alert #${alert.number}`);
    res.status(200).send('Webhook processed successfully');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Internal server error');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Service healthy');
});

// Start server
app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
}); 