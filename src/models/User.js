// User Model with Security Vulnerabilities
// This file demonstrates common data model security issues

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// VULNERABILITY: No schema validation
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    // VULNERABILITY: No uniqueness constraint
    // VULNERABILITY: No length validation
  },
  password: {
    type: String,
    // VULNERABILITY: Password stored in schema (can be queried)
  },
  email: {
    type: String,
    // VULNERABILITY: No email format validation
  },
  role: {
    type: String,
    default: 'user',
    // VULNERABILITY: No enum restriction
  },
  apiKey: {
    type: String,
    // VULNERABILITY: Storing sensitive data in plain text
  },
  creditCard: {
    number: String, // VULNERABILITY: Storing CC in plain text
    cvv: String,    // VULNERABILITY: Storing CVV (should never store)
    expiry: String
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // VULNERABILITY: Storing tokens in database
  resetToken: String,
  resetTokenExpiry: Date,
  refreshToken: String,
  // VULNERABILITY: No audit fields (created/updated timestamps)
});

// VULNERABILITY: Weak password hashing
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  // VULNERABILITY: Low bcrypt rounds (should be at least 10-12)
  this.password = await bcrypt.hash(this.password, 5);
  next();
});

// VULNERABILITY: Method exposes sensitive data
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  // VULNERABILITY: Not removing sensitive fields
  return user;
};

// VULNERABILITY: Comparing passwords in a way vulnerable to timing attacks
UserSchema.methods.comparePassword = function(candidatePassword) {
  // VULNERABILITY: Not using constant-time comparison
  return this.password === candidatePassword;
};

// VULNERABILITY: Generating predictable API keys
UserSchema.methods.generateApiKey = function() {
  // VULNERABILITY: Weak randomness
  this.apiKey = Math.random().toString(36).substring(2, 15);
  return this.apiKey;
};

// VULNERABILITY: No rate limiting on password reset
UserSchema.methods.createPasswordResetToken = function() {
  // VULNERABILITY: Short, predictable token
  const resetToken = Math.random().toString(36).substring(7);
  
  // VULNERABILITY: Token doesn't expire
  this.resetToken = resetToken;
  
  return resetToken;
};

// VULNERABILITY: Direct query methods without sanitization
UserSchema.statics.findByUsername = function(username) {
  // VULNERABILITY: Potential NoSQL injection
  return this.findOne({ username: username });
};

// VULNERABILITY: Bulk operations without validation
UserSchema.statics.updateMany = function(filter, update) {
  // VULNERABILITY: No validation on mass updates
  return mongoose.Model.updateMany.call(this, filter, update);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;