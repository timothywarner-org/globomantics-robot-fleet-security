// Vulnerable Express.js Application for Security Demonstration
// WARNING: This application contains intentional security vulnerabilities for educational purposes
// DO NOT use this code in production!

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// VULNERABILITY: Hardcoded secret key (should use environment variable)
const JWT_SECRET = 'super-secret-key-123';

// VULNERABILITY: Weak helmet configuration (missing important security headers)
app.use(helmet({
  contentSecurityPolicy: false, // CSP disabled - vulnerability
  hsts: false // HSTS disabled - vulnerability
}));

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// VULNERABILITY: Hardcoded database connection string
mongoose.connect('mongodb://admin:password123@localhost:27017/vulnerable-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// User Schema
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  role: { type: String, default: 'user' },
  resetToken: String
});

const User = mongoose.model('User', UserSchema);

// VULNERABILITY: No input validation or sanitization
app.post('/api/register', async (req, res) => {
  const { username, password, email } = req.body;
  
  try {
    // VULNERABILITY: Weak password hashing (low salt rounds)
    const hashedPassword = await bcrypt.hash(password, 5);
    
    // VULNERABILITY: No email validation
    const user = new User({
      username,
      password: hashedPassword,
      email
    });
    
    await user.save();
    res.json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// VULNERABILITY: SQL Injection-like NoSQL injection possible
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // VULNERABILITY: Direct query without sanitization
    const user = await User.findOne({ username: username });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // VULNERABILITY: No token expiration
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET
    );
    
    // VULNERABILITY: Token stored in cookie without security flags
    res.cookie('token', token);
    res.json({ token, user: { username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// VULNERABILITY: No authentication middleware
app.get('/api/users', async (req, res) => {
  try {
    // VULNERABILITY: Exposing sensitive data (passwords)
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// VULNERABILITY: Path traversal vulnerability
app.get('/api/file', (req, res) => {
  const filename = req.query.name;
  
  // VULNERABILITY: No path validation
  const filepath = path.join(__dirname, 'uploads', filename);
  
  fs.readFile(filepath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.send(data);
  });
});

// VULNERABILITY: Command injection
app.post('/api/ping', (req, res) => {
  const { host } = req.body;
  
  // VULNERABILITY: Direct command execution without sanitization
  exec(`ping -c 4 ${host}`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json({ output: stdout });
  });
});

// VULNERABILITY: Server-Side Request Forgery (SSRF)
app.post('/api/fetch-url', async (req, res) => {
  const { url } = req.body;
  
  try {
    // VULNERABILITY: No URL validation
    const axios = require('axios');
    const response = await axios.get(url);
    res.json({ data: response.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// VULNERABILITY: Insecure Direct Object Reference (IDOR)
app.get('/api/user/:id', async (req, res) => {
  try {
    // VULNERABILITY: No authorization check
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// VULNERABILITY: Mass assignment vulnerability
app.put('/api/user/:id', async (req, res) => {
  try {
    // VULNERABILITY: Allowing all fields to be updated including role
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// VULNERABILITY: Weak random token generation
app.post('/api/reset-password', async (req, res) => {
  const { email } = req.body;
  
  try {
    // VULNERABILITY: Predictable token
    const resetToken = Math.random().toString(36).substring(7);
    
    await User.findOneAndUpdate(
      { email },
      { resetToken }
    );
    
    // VULNERABILITY: Token sent in response (should be emailed)
    res.json({ resetToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// VULNERABILITY: XSS vulnerability
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  
  // VULNERABILITY: Reflecting user input without sanitization
  res.send(`
    <html>
      <body>
        <h1>Search Results</h1>
        <p>You searched for: ${q}</p>
      </body>
    </html>
  `);
});

// VULNERABILITY: Information disclosure
app.get('/api/debug', (req, res) => {
  // VULNERABILITY: Exposing sensitive environment information
  res.json({
    env: process.env,
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
    cwd: process.cwd(),
    argv: process.argv
  });
});

// VULNERABILITY: Race condition in account balance update
let accountBalance = 1000;

app.post('/api/withdraw', async (req, res) => {
  const { amount } = req.body;
  
  // VULNERABILITY: No atomic operations or locking
  if (accountBalance >= amount) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 100));
    accountBalance -= amount;
    res.json({ success: true, newBalance: accountBalance });
  } else {
    res.status(400).json({ error: 'Insufficient funds' });
  }
});

// VULNERABILITY: Prototype pollution
app.post('/api/merge', (req, res) => {
  const obj = {};
  
  // VULNERABILITY: Deep merge without protection
  function merge(target, source) {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object') {
        target[key] = merge(target[key] || {}, source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }
  
  merge(obj, req.body);
  res.json({ merged: obj });
});

// VULNERABILITY: Weak session management
const sessions = new Map();

app.post('/api/create-session', (req, res) => {
  // VULNERABILITY: Predictable session ID
  const sessionId = Date.now().toString();
  sessions.set(sessionId, { user: req.body.username });
  res.json({ sessionId });
});

// Error handling
app.use((err, req, res, next) => {
  // VULNERABILITY: Detailed error messages in production
  res.status(500).json({
    error: err.message,
    stack: err.stack,
    type: err.name
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Vulnerable app running on port ${PORT}`);
  console.log('WARNING: This application contains security vulnerabilities!');
});