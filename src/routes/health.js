const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { getRedisClient } = require('../config/database');
const logger = require('../utils/logger');

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Globomantics Robot Fleet Management API',
    version: process.env.npm_package_version || '2.3.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Detailed health check including dependencies
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Detailed health status
 */
router.get('/detailed', async (req, res) => {
  const healthCheck = {
    status: 'healthy',
    service: 'Globomantics Robot Fleet Management API',
    version: process.env.npm_package_version || '2.3.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    dependencies: {
      mongodb: {
        status: 'unknown',
        latency: null
      },
      redis: {
        status: 'unknown',
        latency: null
      }
    },
    system: {
      memory: {
        used: process.memoryUsage(),
        free: process.memoryUsage().heapTotal - process.memoryUsage().heapUsed
      },
      cpu: process.cpuUsage()
    }
  };

  // Check MongoDB
  try {
    const start = Date.now();
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      healthCheck.dependencies.mongodb = {
        status: 'healthy',
        latency: Date.now() - start
      };
    } else {
      healthCheck.dependencies.mongodb.status = 'unhealthy';
      healthCheck.status = 'degraded';
    }
  } catch (error) {
    logger.error('MongoDB health check failed:', error);
    healthCheck.dependencies.mongodb.status = 'unhealthy';
    healthCheck.status = 'degraded';
  }

  // Check Redis
  try {
    const redisClient = getRedisClient();
    const start = Date.now();
    await redisClient.ping();
    healthCheck.dependencies.redis = {
      status: 'healthy',
      latency: Date.now() - start
    };
  } catch (error) {
    logger.error('Redis health check failed:', error);
    healthCheck.dependencies.redis.status = 'unhealthy';
    healthCheck.status = 'degraded';
  }

  const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness probe for Kubernetes
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service is not ready
 */
router.get('/ready', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'not ready',
        reason: 'Database connection not established'
      });
    }

    // Check if Redis is connected
    const redisClient = getRedisClient();
    await redisClient.ping();

    res.json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not ready',
      reason: error.message
    });
  }
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness probe for Kubernetes
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is alive
 */
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;