require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
const { connectDatabase, connectRedis } = require('./config/database');
const mqttClient = require('./config/mqtt');
const swaggerDocs = require('./config/swagger');

// Import routes
const robotRoutes = require('./routes/robots');
const maintenanceRoutes = require('./routes/maintenance');
const telemetryRoutes = require('./routes/telemetry');
const firmwareRoutes = require('./routes/firmware');
const alertRoutes = require('./routes/alerts');
const authRoutes = require('./routes/auth');
const healthRoutes = require('./routes/health');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: logger.stream }));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// API Documentation
swaggerDocs(app);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/robots', rateLimiter, robotRoutes);
app.use('/api/v1/maintenance', rateLimiter, maintenanceRoutes);
app.use('/api/v1/telemetry', rateLimiter, telemetryRoutes);
app.use('/api/v1/firmware', rateLimiter, firmwareRoutes);
app.use('/api/v1/alerts', rateLimiter, alertRoutes);
app.use('/api/v1/health', healthRoutes);

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Socket.io for real-time telemetry
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('subscribe-robot', (robotId) => {
    socket.join(`robot-${robotId}`);
    logger.info(`Client ${socket.id} subscribed to robot ${robotId}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Make io accessible to routes
app.set('io', io);

// MQTT subscription for robot telemetry
mqttClient.on('connect', () => {
  logger.info('Connected to MQTT broker');
  mqttClient.subscribe('robots/+/telemetry');
  mqttClient.subscribe('robots/+/alerts');
});

mqttClient.on('message', (topic, message) => {
  const topicParts = topic.split('/');
  const robotId = topicParts[1];
  const dataType = topicParts[2];
  
  try {
    const data = JSON.parse(message.toString());
    
    if (dataType === 'telemetry') {
      io.to(`robot-${robotId}`).emit('telemetry-update', {
        robotId,
        data,
        timestamp: new Date()
      });
    } else if (dataType === 'alerts') {
      io.to(`robot-${robotId}`).emit('alert', {
        robotId,
        alert: data,
        timestamp: new Date()
      });
    }
  } catch (error) {
    logger.error('Error processing MQTT message:', error);
  }
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Connect to databases
    await connectDatabase();
    await connectRedis();
    
    server.listen(PORT, () => {
      logger.info(`Globomantics Robot Fleet Management System running on port ${PORT}`);
      logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = { app, io };