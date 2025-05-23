const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { auth, authorize } = require('../middleware/auth');
const { maintenanceValidators } = require('../utils/validators');

/**
 * @swagger
 * /maintenance:
 *   get:
 *     summary: Get all maintenance logs
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, in-progress, completed, cancelled]
 *       - in: query
 *         name: robotId
 *         schema:
 *           type: string
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
 *         description: List of maintenance logs
 */
router.get('/', auth, maintenanceController.getMaintenanceLogs);

/**
 * @swagger
 * /maintenance/upcoming:
 *   get:
 *     summary: Get upcoming maintenance schedules
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Number of days to look ahead
 *     responses:
 *       200:
 *         description: Upcoming maintenance schedules
 */
router.get('/upcoming', auth, maintenanceController.getUpcomingMaintenance);

/**
 * @swagger
 * /maintenance/overdue:
 *   get:
 *     summary: Get overdue maintenance tasks
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overdue maintenance tasks
 */
router.get('/overdue', auth, maintenanceController.getOverdueMaintenance);

/**
 * @swagger
 * /maintenance/stats:
 *   get:
 *     summary: Get maintenance statistics
 *     tags: [Maintenance]
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
 *         description: Maintenance statistics
 */
router.get('/stats', auth, maintenanceController.getMaintenanceStats);

/**
 * @swagger
 * /maintenance/{id}:
 *   get:
 *     summary: Get specific maintenance log
 *     tags: [Maintenance]
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
 *         description: Maintenance log details
 *       404:
 *         description: Maintenance log not found
 */
router.get('/:id', auth, maintenanceController.getMaintenanceById);

/**
 * @swagger
 * /maintenance:
 *   post:
 *     summary: Create new maintenance schedule
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MaintenanceLog'
 *     responses:
 *       201:
 *         description: Maintenance scheduled successfully
 */
router.post('/', auth, authorize('technician', 'admin'), maintenanceValidators.create, maintenanceController.createMaintenance);

/**
 * @swagger
 * /maintenance/{id}:
 *   put:
 *     summary: Update maintenance log
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Maintenance log updated
 */
router.put('/:id', auth, authorize('technician', 'admin'), maintenanceValidators.update, maintenanceController.updateMaintenance);

/**
 * @swagger
 * /maintenance/{id}/start:
 *   post:
 *     summary: Start maintenance task
 *     tags: [Maintenance]
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
 *         description: Maintenance started
 */
router.post('/:id/start', auth, authorize('technician', 'admin'), maintenanceController.startMaintenance);

/**
 * @swagger
 * /maintenance/{id}/complete:
 *   post:
 *     summary: Complete maintenance task
 *     tags: [Maintenance]
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
 *               partsReplaced:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Maintenance completed
 */
router.post('/:id/complete', auth, authorize('technician', 'admin'), maintenanceController.completeMaintenance);

/**
 * @swagger
 * /maintenance/{id}/cancel:
 *   post:
 *     summary: Cancel maintenance task
 *     tags: [Maintenance]
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
 *     responses:
 *       200:
 *         description: Maintenance cancelled
 */
router.post('/:id/cancel', auth, authorize('technician', 'admin'), maintenanceController.cancelMaintenance);

module.exports = router;