const MaintenanceLog = require('../models/MaintenanceLog');
const Robot = require('../models/Robot');
const logger = require('../utils/logger');

// Get all maintenance logs
exports.getMaintenanceLogs = async (req, res, next) => {
  try {
    const { status, robotId, startDate, endDate } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (robotId) filter.robotId = robotId;
    if (startDate || endDate) {
      filter.scheduledDate = {};
      if (startDate) filter.scheduledDate.$gte = new Date(startDate);
      if (endDate) filter.scheduledDate.$lte = new Date(endDate);
    }

    const maintenanceLogs = await MaintenanceLog.find(filter)
      .populate('robotId', 'serialNumber name model')
      .sort({ scheduledDate: -1 })
      .limit(100);

    res.json({
      success: true,
      count: maintenanceLogs.length,
      data: maintenanceLogs
    });
  } catch (error) {
    next(error);
  }
};

// Get upcoming maintenance
exports.getUpcomingMaintenance = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const upcoming = await MaintenanceLog.getUpcoming(days);

    res.json({
      success: true,
      count: upcoming.length,
      data: upcoming
    });
  } catch (error) {
    next(error);
  }
};

// Get overdue maintenance
exports.getOverdueMaintenance = async (req, res, next) => {
  try {
    const overdue = await MaintenanceLog.getOverdue();

    res.json({
      success: true,
      count: overdue.length,
      data: overdue
    });
  } catch (error) {
    next(error);
  }
};

// Get maintenance by ID
exports.getMaintenanceById = async (req, res, next) => {
  try {
    const maintenance = await MaintenanceLog.findById(req.params.id)
      .populate('robotId', 'serialNumber name model location');

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        error: 'Maintenance log not found'
      });
    }

    res.json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    next(error);
  }
};

// Create maintenance
exports.createMaintenance = async (req, res, next) => {
  try {
    const robot = await Robot.findById(req.body.robotId);
    
    if (!robot) {
      return res.status(404).json({
        success: false,
        error: 'Robot not found'
      });
    }

    const maintenance = new MaintenanceLog(req.body);
    await maintenance.save();

    logger.info(`Maintenance scheduled for robot ${robot.serialNumber}`);

    res.status(201).json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    next(error);
  }
};

// Update maintenance
exports.updateMaintenance = async (req, res, next) => {
  try {
    const allowedUpdates = ['status', 'scheduledDate', 'description', 'notes'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    const maintenance = await MaintenanceLog.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        error: 'Maintenance log not found'
      });
    }

    res.json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    next(error);
  }
};

// Start maintenance
exports.startMaintenance = async (req, res, next) => {
  try {
    const maintenance = await MaintenanceLog.findById(req.params.id);
    
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        error: 'Maintenance log not found'
      });
    }

    await maintenance.start();

    // Update robot status
    await Robot.findByIdAndUpdate(maintenance.robotId, { status: 'maintenance' });

    logger.info(`Maintenance started: ${maintenance._id}`);

    res.json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    next(error);
  }
};

// Complete maintenance
exports.completeMaintenance = async (req, res, next) => {
  try {
    const maintenance = await MaintenanceLog.findById(req.params.id);
    
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        error: 'Maintenance log not found'
      });
    }

    const { notes, partsReplaced } = req.body;

    if (partsReplaced && partsReplaced.length > 0) {
      maintenance.partsReplaced = partsReplaced;
      maintenance.cost = partsReplaced.reduce((sum, part) => sum + (part.cost || 0), 0);
    }

    await maintenance.complete(notes);

    // Update robot status
    await Robot.findByIdAndUpdate(maintenance.robotId, { 
      status: 'idle',
      'health.motorHealth': 100
    });

    logger.info(`Maintenance completed: ${maintenance._id}`);

    res.json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    next(error);
  }
};

// Cancel maintenance
exports.cancelMaintenance = async (req, res, next) => {
  try {
    const maintenance = await MaintenanceLog.findById(req.params.id);
    
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        error: 'Maintenance log not found'
      });
    }

    await maintenance.cancel(req.body.reason);

    logger.info(`Maintenance cancelled: ${maintenance._id}`);

    res.json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    next(error);
  }
};

// Get maintenance statistics
exports.getMaintenanceStats = async (req, res, next) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    const stats = await MaintenanceLog.getMaintenanceStats(startDate, endDate);
    
    const totalScheduled = await MaintenanceLog.countDocuments({
      scheduledDate: { $gte: startDate, $lte: endDate }
    });

    const completed = await MaintenanceLog.countDocuments({
      status: 'completed',
      completionDate: { $gte: startDate, $lte: endDate }
    });

    res.json({
      success: true,
      data: {
        period: {
          start: startDate,
          end: endDate
        },
        summary: {
          totalScheduled,
          completed,
          completionRate: totalScheduled > 0 ? (completed / totalScheduled * 100).toFixed(2) : 0
        },
        byType: stats
      }
    });
  } catch (error) {
    next(error);
  }
};