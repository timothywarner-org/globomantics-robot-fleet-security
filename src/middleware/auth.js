const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'globomantics-robot-fleet-secret-2024';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    req.userId = decoded.id;
    
    next();
  } catch (error) {
    logger.warn(`Authentication failed: ${req.ip} - ${req.originalUrl}`);
    res.status(401).json({ error: 'Please authenticate' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      logger.warn(`Authorization failed: User ${req.user.username} attempted to access ${req.originalUrl}`);
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  auth,
  authorize,
  generateToken,
  verifyToken
};