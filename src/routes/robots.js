const express = require('express');
const router = express.Router();
const robotController = require('../controllers/robotController');
const { auth, authorize } = require('../middleware/auth');
const { robotValidators } = require('../utils/validators');

/**
 * @swagger
 * /robots:
 *   get:
 *     summary: Get all robots in the fleet
 *     tags: [Robots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, idle, maintenance, error, offline]
 *         description: Filter by robot status
 *       - in: query
 *         name: facility
 *         schema:
 *           type: string
 *         description: Filter by facility
 *       - in: query
 *         name: model
 *         schema:
 *           type: string
 *         description: Filter by robot model
 *     responses:
 *       200:
 *         description: List of robots
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, robotController.getAllRobots);

/**
 * @swagger
 * /robots/stats:
 *   get:
 *     summary: Get fleet statistics
 *     tags: [Robots]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fleet statistics
 */
router.get('/stats', auth, robotController.getFleetStats);

/**
 * @swagger
 * /robots/{id}:
 *   get:
 *     summary: Get a specific robot by ID
 *     tags: [Robots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Robot ID
 *     responses:
 *       200:
 *         description: Robot details
 *       404:
 *         description: Robot not found
 */
router.get('/:id', auth, robotValidators.getById, robotController.getRobotById);

/**
 * @swagger
 * /robots:
 *   post:
 *     summary: Register a new robot
 *     tags: [Robots]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Robot'
 *     responses:
 *       201:
 *         description: Robot created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', auth, authorize('admin', 'technician'), robotValidators.create, robotController.createRobot);

/**
 * @swagger
 * /robots/{id}:
 *   put:
 *     summary: Update robot information
 *     tags: [Robots]
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
 *         description: Robot updated successfully
 */
router.put('/:id', auth, authorize('admin', 'technician'), robotValidators.update, robotController.updateRobot);

/**
 * @swagger
 * /robots/{id}/command:
 *   post:
 *     summary: Send command to robot
 *     tags: [Robots]
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
 *             properties:
 *               command:
 *                 type: string
 *                 enum: [start, stop, pause, resume, return_to_base]
 *               parameters:
 *                 type: object
 *     responses:
 *       200:
 *         description: Command sent successfully
 */
router.post('/:id/command', auth, authorize('operator', 'technician', 'admin'), robotController.sendCommand);

/**
 * @swagger
 * /robots/{id}/maintenance:
 *   post:
 *     summary: Schedule maintenance for robot
 *     tags: [Robots]
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
 *         description: Maintenance scheduled
 */
router.post('/:id/maintenance', auth, authorize('technician', 'admin'), robotController.scheduleMaintenance);

/**
 * @swagger
 * /robots/{id}:
 *   delete:
 *     summary: Decommission a robot
 *     tags: [Robots]
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
 *         description: Robot decommissioned
 */
router.delete('/:id', auth, authorize('admin'), robotController.decommissionRobot);

module.exports = router;