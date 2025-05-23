const Robot = require('../models/Robot');
const MaintenanceLog = require('../models/MaintenanceLog');
const Alert = require('../models/Alert');
const logger = require('../utils/logger');
const mqttClient = require('../config/mqtt');

// Get all robots with filtering
exports.getAllRobots = async (req, res, next) => {
  try {
    const { status, facility, model } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (facility) filter['location.facility'] = facility;
    if (model) filter.model = model;

    const robots = await Robot.find(filter)
      .select('-__v')
      .sort({ lastSeen: -1 });

    res.json({
      success: true,
      count: robots.length,
      data: robots
    });
  } catch (error) {
    next(error);
  }
};

// Get robot by ID
exports.getRobotById = async (req, res, next) => {
  try {
    const robot = await Robot.findById(req.params.id).select('-__v');
    
    if (!robot) {
      return res.status(404).json({
        success: false,
        error: 'Robot not found'
      });
    }

    // Get recent maintenance logs
    const recentMaintenance = await MaintenanceLog.find({ robotId: robot._id })
      .sort({ scheduledDate: -1 })
      .limit(5)
      .select('type status scheduledDate');

    // Get active alerts
    const activeAlerts = await Alert.find({ 
      robotId: robot._id, 
      status: 'active' 
    }).select('type severity message triggeredAt');

    res.json({
      success: true,
      data: {
        ...robot.toObject(),
        recentMaintenance,
        activeAlerts,
        isOnline: robot.isOnline
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create new robot
exports.createRobot = async (req, res, next) => {
  try {
    const robot = new Robot(req.body);
    await robot.save();

    logger.info(`New robot registered: ${robot.serialNumber}`);

    res.status(201).json({
      success: true,
      data: robot
    });
  } catch (error) {
    next(error);
  }
};

// Update robot
exports.updateRobot = async (req, res, next) => {
  try {
    const allowedUpdates = ['name', 'status', 'location', 'firmware', 'metadata'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    const robot = await Robot.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!robot) {
      return res.status(404).json({
        success: false,
        error: 'Robot not found'
      });
    }

    logger.info(`Robot updated: ${robot.serialNumber}`);

    res.json({
      success: true,
      data: robot
    });
  } catch (error) {
    next(error);
  }
};

// Send command to robot
exports.sendCommand = async (req, res, next) => {
  try {
    const { command, parameters } = req.body;
    const robot = await Robot.findById(req.params.id);

    if (!robot) {
      return res.status(404).json({
        success: false,
        error: 'Robot not found'
      });
    }

    if (!robot.isOnline) {
      return res.status(400).json({
        success: false,
        error: 'Robot is offline'
      });
    }

    // Publish command via MQTT
    const commandPayload = {
      command,
      parameters: parameters || {},
      timestamp: new Date(),
      commandId: require('uuid').v4(),
      issuedBy: req.user.username
    };

    mqttClient.publish(
      `robots/${robot.serialNumber}/commands`,
      JSON.stringify(commandPayload)
    );

    logger.info(`Command sent to robot ${robot.serialNumber}: ${command}`);

    res.json({
      success: true,
      message: 'Command sent successfully',
      commandId: commandPayload.commandId
    });
  } catch (error) {
    next(error);
  }
};

// Get fleet statistics
exports.getFleetStats = async (req, res, next) => {
  try {
    const stats = await Robot.getFleetStats();
    
    const totalRobots = await Robot.countDocuments();
    const onlineRobots = await Robot.countDocuments({
      lastSeen: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });

    const facilityStats = await Robot.aggregate([
      {
        $group: {
          _id: '$location.facility',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        total: totalRobots,
        online: onlineRobots,
        offline: totalRobots - onlineRobots,
        statusBreakdown: stats.statusBreakdown,
        modelBreakdown: stats.modelBreakdown,
        facilityBreakdown: facilityStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// Schedule maintenance for robot
exports.scheduleMaintenance = async (req, res, next) => {
  try {
    const robot = await Robot.findById(req.params.id);
    
    if (!robot) {
      return res.status(404).json({
        success: false,
        error: 'Robot not found'
      });
    }

    const maintenanceLog = new MaintenanceLog({
      robotId: robot._id,
      type: 'routine',
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      technician: {
        id: req.user.id,
        name: req.user.username
      },
      description: 'Scheduled routine maintenance'
    });

    await maintenanceLog.save();
    
    robot.status = 'maintenance';
    await robot.save();

    logger.info(`Maintenance scheduled for robot ${robot.serialNumber}`);

    res.json({
      success: true,
      data: maintenanceLog
    });
  } catch (error) {
    next(error);
  }
};

// Decommission robot
exports.decommissionRobot = async (req, res, next) => {
  try {
    const robot = await Robot.findById(req.params.id);
    
    if (!robot) {
      return res.status(404).json({
        success: false,
        error: 'Robot not found'
      });
    }

    robot.status = 'offline';
    robot.metadata.set('decommissioned', true);
    robot.metadata.set('decommissionedDate', new Date());
    robot.metadata.set('decommissionedBy', req.user.username);
    await robot.save();

    logger.info(`Robot decommissioned: ${robot.serialNumber}`);

    res.json({
      success: true,
      message: 'Robot decommissioned successfully'
    });
  } catch (error) {
    next(error);
  }
};