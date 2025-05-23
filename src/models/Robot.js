const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Robot:
 *       type: object
 *       required:
 *         - serialNumber
 *         - model
 *         - location
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *         serialNumber:
 *           type: string
 *           description: Unique serial number of the robot
 *         model:
 *           type: string
 *           enum: [GM-W100, GM-W200, GM-F150, GM-F300, GM-X500]
 *           description: Robot model type
 *         name:
 *           type: string
 *           description: Friendly name for the robot
 *         status:
 *           type: string
 *           enum: [active, idle, maintenance, error, offline]
 *           default: idle
 *         location:
 *           type: object
 *           properties:
 *             facility:
 *               type: string
 *             zone:
 *               type: string
 *             coordinates:
 *               type: object
 *               properties:
 *                 x:
 *                   type: number
 *                 y:
 *                   type: number
 *                 z:
 *                   type: number
 *         firmware:
 *           type: object
 *           properties:
 *             version:
 *               type: string
 *             lastUpdate:
 *               type: string
 *               format: date-time
 *         performance:
 *           type: object
 *           properties:
 *             uptime:
 *               type: number
 *               description: Uptime in hours
 *             tasksCompleted:
 *               type: number
 *             efficiency:
 *               type: number
 *               description: Efficiency percentage
 *         health:
 *           type: object
 *           properties:
 *             battery:
 *               type: number
 *               description: Battery percentage
 *             temperature:
 *               type: number
 *               description: Temperature in Celsius
 *             motorHealth:
 *               type: number
 *               description: Motor health percentage
 *         lastSeen:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const robotSchema = new mongoose.Schema({
  serialNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  model: {
    type: String,
    required: true,
    enum: ['GM-W100', 'GM-W200', 'GM-F150', 'GM-F300', 'GM-X500']
  },
  name: {
    type: String,
    default: function() {
      return `Robot-${this.serialNumber.slice(-6)}`;
    }
  },
  status: {
    type: String,
    enum: ['active', 'idle', 'maintenance', 'error', 'offline'],
    default: 'idle',
    index: true
  },
  location: {
    facility: {
      type: String,
      required: true
    },
    zone: String,
    coordinates: {
      x: Number,
      y: Number,
      z: Number
    }
  },
  firmware: {
    version: {
      type: String,
      default: '1.0.0'
    },
    lastUpdate: {
      type: Date,
      default: Date.now
    }
  },
  performance: {
    uptime: {
      type: Number,
      default: 0
    },
    tasksCompleted: {
      type: Number,
      default: 0
    },
    efficiency: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    }
  },
  health: {
    battery: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    temperature: {
      type: Number,
      default: 25
    },
    motorHealth: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    }
  },
  lastSeen: {
    type: Date,
    default: Date.now,
    index: true
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for performance
robotSchema.index({ status: 1, 'location.facility': 1 });
robotSchema.index({ model: 1, status: 1 });
robotSchema.index({ lastSeen: -1 });

// Virtual for online status
robotSchema.virtual('isOnline').get(function() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.lastSeen > fiveMinutesAgo;
});

// Methods
robotSchema.methods.updateTelemetry = function(telemetryData) {
  if (telemetryData.battery !== undefined) {
    this.health.battery = telemetryData.battery;
  }
  if (telemetryData.temperature !== undefined) {
    this.health.temperature = telemetryData.temperature;
  }
  if (telemetryData.coordinates) {
    this.location.coordinates = telemetryData.coordinates;
  }
  this.lastSeen = new Date();
  return this.save();
};

robotSchema.methods.startMaintenance = function() {
  this.status = 'maintenance';
  return this.save();
};

robotSchema.methods.endMaintenance = function() {
  this.status = 'idle';
  this.health.motorHealth = 100;
  return this.save();
};

// Statics
robotSchema.statics.findByFacility = function(facility) {
  return this.find({ 'location.facility': facility });
};

robotSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

robotSchema.statics.getFleetStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const modelStats = await this.aggregate([
    {
      $group: {
        _id: '$model',
        count: { $sum: 1 },
        avgEfficiency: { $avg: '$performance.efficiency' }
      }
    }
  ]);
  
  return { statusBreakdown: stats, modelBreakdown: modelStats };
};

module.exports = mongoose.model('Robot', robotSchema);