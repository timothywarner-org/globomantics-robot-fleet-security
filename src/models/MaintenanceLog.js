const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     MaintenanceLog:
 *       type: object
 *       required:
 *         - robotId
 *         - type
 *         - technician
 *       properties:
 *         _id:
 *           type: string
 *         robotId:
 *           type: string
 *           description: Reference to the robot
 *         type:
 *           type: string
 *           enum: [routine, repair, upgrade, emergency]
 *         status:
 *           type: string
 *           enum: [scheduled, in-progress, completed, cancelled]
 *         scheduledDate:
 *           type: string
 *           format: date-time
 *         startDate:
 *           type: string
 *           format: date-time
 *         completionDate:
 *           type: string
 *           format: date-time
 *         technician:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *         description:
 *           type: string
 *         partsReplaced:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               partNumber:
 *                 type: string
 *               partName:
 *                 type: string
 *               quantity:
 *                 type: number
 *         cost:
 *           type: number
 *         notes:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

const maintenanceLogSchema = new mongoose.Schema({
  robotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Robot',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['routine', 'repair', 'upgrade', 'emergency'],
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled',
    index: true
  },
  scheduledDate: {
    type: Date,
    required: true,
    index: true
  },
  startDate: Date,
  completionDate: Date,
  technician: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  description: {
    type: String,
    required: true
  },
  partsReplaced: [{
    partNumber: String,
    partName: String,
    quantity: {
      type: Number,
      default: 1
    },
    cost: Number
  }],
  procedures: [{
    step: Number,
    description: String,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  cost: {
    type: Number,
    default: 0
  },
  downtime: {
    type: Number, // in minutes
    default: 0
  },
  notes: String,
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
maintenanceLogSchema.index({ robotId: 1, scheduledDate: -1 });
maintenanceLogSchema.index({ status: 1, scheduledDate: 1 });
maintenanceLogSchema.index({ 'technician.id': 1, status: 1 });

// Virtual for duration
maintenanceLogSchema.virtual('duration').get(function() {
  if (this.startDate && this.completionDate) {
    return Math.round((this.completionDate - this.startDate) / (1000 * 60)); // in minutes
  }
  return null;
});

// Methods
maintenanceLogSchema.methods.start = function() {
  this.status = 'in-progress';
  this.startDate = new Date();
  return this.save();
};

maintenanceLogSchema.methods.complete = function(notes) {
  this.status = 'completed';
  this.completionDate = new Date();
  if (notes) {
    this.notes = notes;
  }
  if (this.startDate) {
    this.downtime = Math.round((this.completionDate - this.startDate) / (1000 * 60));
  }
  return this.save();
};

maintenanceLogSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  this.notes = reason || 'Cancelled';
  return this.save();
};

maintenanceLogSchema.methods.addPart = function(part) {
  this.partsReplaced.push(part);
  this.cost += part.cost || 0;
  return this.save();
};

// Statics
maintenanceLogSchema.statics.getUpcoming = function(days = 7) {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  
  return this.find({
    status: 'scheduled',
    scheduledDate: {
      $gte: new Date(),
      $lte: endDate
    }
  }).populate('robotId', 'serialNumber name model');
};

maintenanceLogSchema.statics.getOverdue = function() {
  return this.find({
    status: 'scheduled',
    scheduledDate: { $lt: new Date() }
  }).populate('robotId', 'serialNumber name model');
};

maintenanceLogSchema.statics.getMaintenanceStats = async function(startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        completionDate: {
          $gte: startDate,
          $lte: endDate
        },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalCost: { $sum: '$cost' },
        avgDowntime: { $avg: '$downtime' }
      }
    }
  ]);
  
  return stats;
};

module.exports = mongoose.model('MaintenanceLog', maintenanceLogSchema);