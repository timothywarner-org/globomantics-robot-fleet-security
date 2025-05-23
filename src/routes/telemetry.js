const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/telemetryController');
const { auth } = require('../middleware/auth');
const { telemetryValidators } = require('../utils/validators');

/**
 * @swagger
 * /telemetry:
 *   get:
 *     summary: Get telemetry data
 *     tags: [Telemetry]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: robotId
 *         schema:
 *           type: string
 *         description: Filter by robot ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for telemetry data
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for telemetry data
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of records to return
 *     responses:
 *       200:
 *         description: Telemetry data
 */
router.get('/', auth, telemetryValidators.query, telemetryController.getTelemetry);

/**
 * @swagger
 * /telemetry/latest:
 *   get:
 *     summary: Get latest telemetry for all robots
 *     tags: [Telemetry]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Latest telemetry data for each robot
 */
router.get('/latest', auth, telemetryController.getLatestTelemetry);

/**
 * @swagger
 * /telemetry/robot/{robotId}:
 *   get:
 *     summary: Get telemetry history for specific robot
 *     tags: [Telemetry]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: robotId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           default: 24
 *         description: Number of hours of history to retrieve
 *     responses:
 *       200:
 *         description: Robot telemetry history
 */
router.get('/robot/:robotId', auth, telemetryController.getRobotTelemetry);

/**
 * @swagger
 * /telemetry/aggregate:
 *   get:
 *     summary: Get aggregated telemetry statistics
 *     tags: [Telemetry]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: robotId
 *         schema:
 *           type: string
 *       - in: query
 *         name: metric
 *         schema:
 *           type: string
 *           enum: [battery, temperature, efficiency]
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           enum: [hour, day, week, month]
 *     responses:
 *       200:
 *         description: Aggregated telemetry statistics
 */
router.get('/aggregate', auth, telemetryController.getAggregatedTelemetry);

/**
 * @swagger
 * /telemetry:
 *   post:
 *     summary: Submit telemetry data
 *     tags: [Telemetry]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               robotId:
 *                 type: string
 *               battery:
 *                 type: number
 *               temperature:
 *                 type: number
 *               coordinates:
 *                 type: object
 *                 properties:
 *                   x:
 *                     type: number
 *                   y:
 *                     type: number
 *                   z:
 *                     type: number
 *               speed:
 *                 type: number
 *               tasksCompleted:
 *                 type: number
 *               errors:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Telemetry data recorded
 */
router.post('/', auth, telemetryValidators.create, telemetryController.createTelemetry);

/**
 * @swagger
 * /telemetry/batch:
 *   post:
 *     summary: Submit batch telemetry data
 *     tags: [Telemetry]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *     responses:
 *       201:
 *         description: Batch telemetry data recorded
 */
router.post('/batch', auth, telemetryController.createBatchTelemetry);

/**
 * @swagger
 * /telemetry/stream:
 *   get:
 *     summary: Subscribe to real-time telemetry stream
 *     tags: [Telemetry]
 *     security:
 *       - bearerAuth: []
 *     description: WebSocket endpoint for real-time telemetry
 *     responses:
 *       200:
 *         description: WebSocket connection established
 */
router.get('/stream', auth, telemetryController.streamTelemetry);

module.exports = router;