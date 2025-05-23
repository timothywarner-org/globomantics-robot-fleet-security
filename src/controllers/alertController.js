const Alert = require('../models/Alert');
const logger = require('../utils/logger');

// Get alerts
exports.getAlerts = async (req, res, next) => {
  try {
    const { status, severity, robotId, type, limit = 50 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (robotId) filter.robotId = robotId;
    if (type) filter.type = type;

    const alerts = await Alert.find(filter)
      .populate('robotId', 'serialNumber name model')
      .sort({ triggeredAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

// Get active alerts
exports.getActiveAlerts = async (req, res, next) => {
  try {
    const { severity } = req.query;
    const alerts = await Alert.getActiveAlerts(severity);

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

// Get alert by ID
exports.getAlertById = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('robotId', 'serialNumber name model location');

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

// Acknowledge alert
exports.acknowledgeAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    await alert.acknowledge(req.user);

    logger.info(`Alert acknowledged: ${alert._id}`);

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

// Resolve alert
exports.resolveAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    await alert.resolve(req.user, req.body.notes);

    logger.info(`Alert resolved: ${alert._id}`);

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

// Escalate alert
exports.escalateAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    await alert.addAction('escalated', req.user, req.body.reason);

    logger.info(`Alert escalated: ${alert._id}`);

    res.json({
      success: true,
      message: 'Alert escalated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Bulk acknowledge alerts
exports.bulkAcknowledgeAlerts = async (req, res, next) => {
  try {
    const { alertIds } = req.body;

    const alerts = await Alert.find({ _id: { $in: alertIds } });

    const acknowledgedAlerts = await Promise.all(
      alerts.map(alert => alert.acknowledge(req.user))
    );

    logger.info(`Bulk acknowledged ${acknowledgedAlerts.length} alerts`);

    res.json({
      success: true,
      count: acknowledgedAlerts.length,
      message: `${acknowledgedAlerts.length} alerts acknowledged`
    });
  } catch (error) {
    next(error);
  }
};

// Get alert statistics
exports.getAlertStats = async (req, res, next) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    const stats = await Alert.getAlertStats(startDate, endDate);

    res.json({
      success: true,
      data: {
        period: {
          start: startDate,
          end: endDate
        },
        stats
      }
    });
  } catch (error) {
    next(error);
  }
};

// Subscribe to alerts (WebSocket endpoint)
exports.subscribeToAlerts = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'WebSocket endpoint for real-time alerts',
      wsUrl: `ws://${req.get('host')}/alerts/stream`
    });
  } catch (error) {
    next(error);
  }
};