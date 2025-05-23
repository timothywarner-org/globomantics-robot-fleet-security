const rateLimit = require('express-rate-limit');
const { getRedisClient } = require('../config/database');
const logger = require('../utils/logger');

// Create a custom store using Redis
class RedisStore {
  constructor() {
    this.client = null;
  }

  async init() {
    try {
      this.client = getRedisClient();
    } catch (error) {
      logger.warn('Redis not available for rate limiting, using memory store');
    }
  }

  async increment(key) {
    if (!this.client) {
      return { totalHits: 1, resetTime: new Date(Date.now() + 60000) };
    }

    try {
      const multi = this.client.multi();
      multi.incr(key);
      multi.expire(key, 60); // 1 minute expiry
      const results = await multi.exec();
      
      return {
        totalHits: results[0],
        resetTime: new Date(Date.now() + 60000)
      };
    } catch (error) {
      logger.error('Redis rate limit error:', error);
      return { totalHits: 1, resetTime: new Date(Date.now() + 60000) };
    }
  }

  async decrement(key) {
    if (!this.client) return;
    
    try {
      await this.client.decr(key);
    } catch (error) {
      logger.error('Redis decrement error:', error);
    }
  }

  async resetKey(key) {
    if (!this.client) return;
    
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Redis reset error:', error);
    }
  }
}

// Create rate limiter instance
const createRateLimiter = (options = {}) => {
  const store = new RedisStore();
  store.init();

  return rateLimit({
    windowMs: options.windowMs || 1 * 60 * 1000, // 1 minute
    max: options.max || 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    store: store,
    keyGenerator: (req) => {
      return req.ip + ':' + (req.user?.id || 'anonymous');
    },
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for ${req.ip} on ${req.originalUrl}`);
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.round(options.windowMs / 1000)
      });
    }
  });
};

// Different rate limiters for different endpoints
const strictRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10 // 10 requests per minute
});

const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // 5 login attempts per 15 minutes
});

const apiRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100 // 100 requests per minute
});

module.exports = apiRateLimiter;
module.exports.strict = strictRateLimiter;
module.exports.auth = authRateLimiter;
module.exports.api = apiRateLimiter;