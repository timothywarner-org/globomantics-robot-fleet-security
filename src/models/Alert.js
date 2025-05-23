const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Alert:
 *       type: object
 *       required:
 *         - robotId
 *         - type
 *         - severity
 *         - message
 *       properties:
 *         _id:
 *           type: string
 *         robotId:
 *           type: string
 *         type:
 *           type: string
 *           enum: [battery_low, temperature_high, motor_failure, connection_lost, maintenance_due, collision_detected, firmware_update]
 *         severity:
 *           type: string
 *           enum: [info, warning, error, critical]
 *         message:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, acknowledged, resolved]
 *         triggeredAt:
 *           type: string
 *           format: date-time
 *         acknowledgedAt:
 *           type: string
 *           format: date-time
 *         resolvedAt:
 *           type: string
 *           format: date-time
 *         acknowledgedBy:
 *           type: object
 *           properties:
 *             userId:
 *               type: string
 *             username:
 *               type: string
 *         metadata:
 *           type: object
 */

const alertSchema = new mongoose.Schema({
  robotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Robot',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['battery_low', 'temperature_high', 'motor_failure', 'connection_lost', 
           'maintenance_due', 'collision_detected', 'firmware_update'],
    required: true
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved'],
    default: 'active',
    index: true
  },
  triggeredAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  acknowledgedAt: Date,
  resolvedAt: Date,
  acknowledgedBy: {
    userId: String,
    username: String
  },
  resolvedBy: {
    userId: String,
    username: String
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  actions: [{
    action: String,
    performedBy: {
      userId: String,
      username: String
    },
    performedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }]
}, {
  timestamps: true
});

// Indexes
alertSchema.index({ status: 1, severity: 1, triggeredAt: -1 });
alertSchema.index({ robotId: 1, status: 1 });
alertSchema.index({ type: 1, status: 1 });

// Virtual for duration
alertSchema.virtual('duration').get(function() {
  const endTime = this.resolvedAt || new Date();
  return Math.round((endTime - this.triggeredAt) / 1000); // in seconds
});

// Methods
alertSchema.methods.acknowledge = function(user) {
  this.status = 'acknowledged';
  this.acknowledgedAt = new Date();
  this.acknowledgedBy = {
    userId: user.id,
    username: user.username
  };
  this.actions.push({
    action: 'acknowledged',
    performedBy: {
      userId: user.id,
      username: user.username
    }
  });
  return this.save();
};

alertSchema.methods.resolve = function(user, notes) {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  this.resolvedBy = {
    userId: user.id,
    username: user.username
  };
  this.actions.push({
    action: 'resolved',
    performedBy: {
      userId: user.id,
      username: user.username
    },
    notes
  });
  return this.save();
};

alertSchema.methods.addAction = function(action, user, notes) {
  this.actions.push({
    action,
    performedBy: {
      userId: user.id,
      username: user.username
    },
    notes
  });
  return this.save();
};

// Statics
alertSchema.statics.getActiveAlerts = function(severity) {
  const query = { status: 'active' };
  if (severity) {
    query.severity = severity;
  }
  return this.find(query)
    .populate('robotId', 'serialNumber name model location')
    .sort('-triggeredAt');
};

alertSchema.statics.getAlertsByRobot = function(robotId, limit = 50) {
  return this.find({ robotId })
    .sort('-triggeredAt')
    .limit(limit);
};

alertSchema.statics.getAlertStats = async function(startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        triggeredAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          type: '$type',
          severity: '$severity'
        },
        count: { $sum: 1 },
        avgResolutionTime: {
          $avg: {
            $cond: [
              { $eq: ['$status', 'resolved'] },
              { $subtract: ['$resolvedAt', '$triggeredAt'] },
              null
            ]
          }
        }
      }
    },
    {
      $group: {
        _id: '$_id.type',
        severities: {
          $push: {
            severity: '$_id.severity',
            count: '$count',
            avgResolutionTime: '$avgResolutionTime'
          }
        },
        totalCount: { $sum: '$count' }
      }
    }
  ]);
  
  return stats;
};

// Pre-save hook to send notifications for critical alerts
alertSchema.pre('save', async function(next) {
  if (this.isNew && this.severity === 'critical') {
    // In a real application, this would trigger notifications
    console.log(`CRITICAL ALERT: ${this.type} for robot ${this.robotId}`);
  }
  next();
});

module.exports = mongoose.model('Alert', alertSchema);