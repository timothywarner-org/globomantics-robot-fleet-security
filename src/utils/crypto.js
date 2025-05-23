// Cryptographic Utilities with Security Vulnerabilities
// This file demonstrates common cryptographic mistakes

const crypto = require('crypto');

// VULNERABILITY: Weak encryption algorithm
const ALGORITHM = 'aes-128-ecb'; // ECB mode is insecure
const ENCRYPTION_KEY = 'mysecretkey12345'; // VULNERABILITY: Hardcoded key

// VULNERABILITY: Insecure random number generation
function generateRandomToken(length) {
  // VULNERABILITY: Using Math.random() for security purposes
  let token = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return token;
}

// VULNERABILITY: Weak hashing for passwords
function hashPassword(password) {
  // VULNERABILITY: Using MD5 for password hashing
  return crypto.createHash('md5').update(password).digest('hex');
}

// VULNERABILITY: Insecure encryption implementation
function encrypt(text) {
  // VULNERABILITY: No IV (Initialization Vector)
  // VULNERABILITY: ECB mode
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// VULNERABILITY: Insecure decryption
function decrypt(encrypted) {
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// VULNERABILITY: Weak key derivation
function deriveKey(password, salt) {
  // VULNERABILITY: Using SHA1 for key derivation
  // VULNERABILITY: No iterations (should use PBKDF2 with high iterations)
  return crypto.createHash('sha1').update(password + salt).digest();
}

// VULNERABILITY: Predictable salt generation
function generateSalt() {
  // VULNERABILITY: Using timestamp as salt
  return Date.now().toString();
}

// VULNERABILITY: Insecure random ID generation
function generateUserId() {
  // VULNERABILITY: Sequential and predictable
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// VULNERABILITY: Weak session token
function generateSessionToken() {
  // VULNERABILITY: Including predictable elements
  const timestamp = Date.now();
  const random = Math.random().toString(36);
  return Buffer.from(`${timestamp}:${random}`).toString('base64');
}

// VULNERABILITY: Insecure comparison vulnerable to timing attacks
function secureCompare(a, b) {
  // VULNERABILITY: Early return on mismatch
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  
  return true;
}

// VULNERABILITY: Weak HMAC implementation
function createHmac(data) {
  // VULNERABILITY: Weak key and algorithm
  const key = 'hmac-key';
  return crypto.createHmac('sha1', key).update(data).digest('hex');
}

// VULNERABILITY: Insecure file encryption
function encryptFile(buffer) {
  // VULNERABILITY: No authentication (should use AES-GCM)
  const cipher = crypto.createCipher('aes-128-cbc', ENCRYPTION_KEY);
  return Buffer.concat([cipher.update(buffer), cipher.final()]);
}

// VULNERABILITY: Using deprecated crypto methods
function oldEncrypt(text) {
  // VULNERABILITY: createCipher is deprecated
  const cipher = crypto.createCipher('des', 'password'); // DES is broken
  return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

module.exports = {
  generateRandomToken,
  hashPassword,
  encrypt,
  decrypt,
  deriveKey,
  generateSalt,
  generateUserId,
  generateSessionToken,
  secureCompare,
  createHmac,
  encryptFile,
  oldEncrypt
};