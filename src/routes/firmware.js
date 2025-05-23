const express = require('express');
const router = express.Router();
const firmwareController = require('../controllers/firmwareController');
const { auth, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /firmware:
 *   get:
 *     summary: Get all firmware versions
 *     tags: [Firmware]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of firmware versions
 */
router.get('/', auth, firmwareController.getAllFirmware);

/**
 * @swagger
 * /firmware/latest:
 *   get:
 *     summary: Get latest firmware version for each model
 *     tags: [Firmware]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Latest firmware versions by model
 */
router.get('/latest', auth, firmwareController.getLatestFirmware);

/**
 * @swagger
 * /firmware/{version}:
 *   get:
 *     summary: Get specific firmware version details
 *     tags: [Firmware]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: version
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Firmware version details
 *       404:
 *         description: Firmware version not found
 */
router.get('/:version', auth, firmwareController.getFirmwareByVersion);

/**
 * @swagger
 * /firmware:
 *   post:
 *     summary: Upload new firmware version
 *     tags: [Firmware]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               version:
 *                 type: string
 *               model:
 *                 type: string
 *               changelog:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Firmware uploaded successfully
 */
router.post('/', auth, authorize('admin'), firmwareController.uploadFirmware);

/**
 * @swagger
 * /firmware/update/{robotId}:
 *   post:
 *     summary: Initiate firmware update for specific robot
 *     tags: [Firmware]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: robotId
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
 *               version:
 *                 type: string
 *               force:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: Firmware update initiated
 */
router.post('/update/:robotId', auth, authorize('technician', 'admin'), firmwareController.updateRobotFirmware);

/**
 * @swagger
 * /firmware/update/batch:
 *   post:
 *     summary: Initiate firmware update for multiple robots
 *     tags: [Firmware]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               robotIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               version:
 *                 type: string
 *               schedule:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Batch firmware update scheduled
 */
router.post('/update/batch', auth, authorize('admin'), firmwareController.batchUpdateFirmware);

/**
 * @swagger
 * /firmware/update/status/{updateId}:
 *   get:
 *     summary: Get firmware update status
 *     tags: [Firmware]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: updateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Update status
 */
router.get('/update/status/:updateId', auth, firmwareController.getUpdateStatus);

/**
 * @swagger
 * /firmware/rollback/{robotId}:
 *   post:
 *     summary: Rollback firmware to previous version
 *     tags: [Firmware]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: robotId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Firmware rollback initiated
 */
router.post('/rollback/:robotId', auth, authorize('technician', 'admin'), firmwareController.rollbackFirmware);

module.exports = router;