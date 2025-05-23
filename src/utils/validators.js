const { body, param, query, validationResult } = require('express-validator');

// Common validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation Error',
      details: errors.array() 
    });
  }
  next();
};

// Robot validators
const robotValidators = {
  create: [
    body('serialNumber')
      .trim()
      .notEmpty().withMessage('Serial number is required')
      .matches(/^[A-Z0-9-]+$/).withMessage('Serial number must contain only uppercase letters, numbers, and hyphens'),
    body('model')
      .isIn(['GM-W100', 'GM-W200', 'GM-F150', 'GM-F300', 'GM-X500'])
      .withMessage('Invalid robot model'),
    body('location.facility')
      .trim()
      .notEmpty().withMessage('Facility is required'),
    body('location.zone')
      .optional()
      .trim(),
    body('location.coordinates.x')
      .optional()
      .isFloat().withMessage('X coordinate must be a number'),
    body('location.coordinates.y')
      .optional()
      .isFloat().withMessage('Y coordinate must be a number'),
    body('location.coordinates.z')
      .optional()
      .isFloat().withMessage('Z coordinate must be a number'),
    validate
  ],
  
  update: [
    param('id').isMongoId().withMessage('Invalid robot ID'),
    body('status')
      .optional()
      .isIn(['active', 'idle', 'maintenance', 'error', 'offline'])
      .withMessage('Invalid status'),
    body('location.facility')
      .optional()
      .trim()
      .notEmpty().withMessage('Facility cannot be empty'),
    validate
  ],
  
  getById: [
    param('id').isMongoId().withMessage('Invalid robot ID'),
    validate
  ]
};

// Maintenance validators
const maintenanceValidators = {
  create: [
    body('robotId').isMongoId().withMessage('Invalid robot ID'),
    body('type')
      .isIn(['routine', 'repair', 'upgrade', 'emergency'])
      .withMessage('Invalid maintenance type'),
    body('scheduledDate')
      .isISO8601().withMessage('Invalid date format')
      .custom((value) => new Date(value) > new Date())
      .withMessage('Scheduled date must be in the future'),
    body('technician.id')
      .trim()
      .notEmpty().withMessage('Technician ID is required'),
    body('technician.name')
      .trim()
      .notEmpty().withMessage('Technician name is required'),
    body('description')
      .trim()
      .notEmpty().withMessage('Description is required')
      .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    validate
  ],
  
  update: [
    param('id').isMongoId().withMessage('Invalid maintenance log ID'),
    body('status')
      .optional()
      .isIn(['scheduled', 'in-progress', 'completed', 'cancelled'])
      .withMessage('Invalid status'),
    validate
  ]
};

// Telemetry validators
const telemetryValidators = {
  create: [
    body('robotId').isMongoId().withMessage('Invalid robot ID'),
    body('battery')
      .optional()
      .isFloat({ min: 0, max: 100 }).withMessage('Battery must be between 0 and 100'),
    body('temperature')
      .optional()
      .isFloat({ min: -50, max: 100 }).withMessage('Temperature must be between -50 and 100'),
    body('coordinates')
      .optional()
      .isObject().withMessage('Coordinates must be an object'),
    body('coordinates.x')
      .optional()
      .isFloat().withMessage('X coordinate must be a number'),
    body('coordinates.y')
      .optional()
      .isFloat().withMessage('Y coordinate must be a number'),
    body('coordinates.z')
      .optional()
      .isFloat().withMessage('Z coordinate must be a number'),
    validate
  ],
  
  query: [
    query('robotId').optional().isMongoId().withMessage('Invalid robot ID'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
    validate
  ]
};

// Alert validators
const alertValidators = {
  update: [
    param('id').isMongoId().withMessage('Invalid alert ID'),
    body('action')
      .optional()
      .isIn(['acknowledge', 'resolve', 'escalate'])
      .withMessage('Invalid action'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Notes must not exceed 500 characters'),
    validate
  ],
  
  query: [
    query('status')
      .optional()
      .isIn(['active', 'acknowledged', 'resolved'])
      .withMessage('Invalid status'),
    query('severity')
      .optional()
      .isIn(['info', 'warning', 'error', 'critical'])
      .withMessage('Invalid severity'),
    query('robotId').optional().isMongoId().withMessage('Invalid robot ID'),
    validate
  ]
};

// Auth validators
const authValidators = {
  register: [
    body('username')
      .trim()
      .notEmpty().withMessage('Username is required')
      .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('role')
      .optional()
      .isIn(['operator', 'technician', 'admin'])
      .withMessage('Invalid role'),
    validate
  ],
  
  login: [
    body('username')
      .trim()
      .notEmpty().withMessage('Username is required'),
    body('password')
      .notEmpty().withMessage('Password is required'),
    validate
  ]
};

module.exports = {
  validate,
  robotValidators,
  maintenanceValidators,
  telemetryValidators,
  alertValidators,
  authValidators
};