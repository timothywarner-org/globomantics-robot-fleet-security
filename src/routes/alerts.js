const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { auth, authorize } = require('../middleware/auth');
const { alertValidators } = require('../utils/validators');

/**
 * @swagger
 * /alerts:
 *   get:
 *     summary: Get all alerts
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, acknowledged, resolved]
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [info, warning, error, critical]
 *       - in: query
 *         name: robotId
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: List of alerts
 */
router.get('/', auth, alertValidators.query, alertController.getAlerts);

/**
 * @swagger
 * /alerts/active:
 *   get:
 *     summary: Get all active alerts
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [info, warning, error, critical]
 *     responses:
 *       200:
 *         description: List of active alerts
 */
router.get('/active', auth, alertController.getActiveAlerts);

/**
 * @swagger
 * /alerts/stats:
 *   get:
 *     summary: Get alert statistics
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Alert statistics
 */
router.get('/stats', auth, alertController.getAlertStats);

/**
 * @swagger
 * /alerts/{id}:
 *   get:
 *     summary: Get specific alert
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alert details
 *       404:
 *         description: Alert not found
 */
router.get('/:id', auth, alertController.getAlertById);

/**
 * @swagger
 * /alerts/{id}/acknowledge:
 *   post:
 *     summary: Acknowledge an alert
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alert acknowledged
 */
router.post('/:id/acknowledge', auth, alertController.acknowledgeAlert);

/**
 * @swagger
 * /alerts/{id}/resolve:
 *   post:
 *     summary: Resolve an alert
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Alert resolved
 */
router.post('/:id/resolve', auth, authorize('operator', 'technician', 'admin'), alertController.resolveAlert);

/**
 * @swagger
 * /alerts/{id}/escalate:
 *   post:
 *     summary: Escalate an alert
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *               assignTo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Alert escalated
 */
router.post('/:id/escalate', auth, alertController.escalateAlert);

/**
 * @swagger
 * /alerts/bulk/acknowledge:
 *   post:
 *     summary: Acknowledge multiple alerts
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               alertIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Alerts acknowledged
 */
router.post('/bulk/acknowledge', auth, alertController.bulkAcknowledgeAlerts);

/**
 * @swagger
 * /alerts/subscribe:
 *   get:
 *     summary: Subscribe to real-time alert updates
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     description: WebSocket endpoint for real-time alerts
 *     responses:
 *       200:
 *         description: WebSocket connection established
 */
router.get('/subscribe', auth, alertController.subscribeToAlerts);

module.exports = router;