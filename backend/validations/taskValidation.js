const { body, query, param } = require('express-validator');

const taskValidation = {
  createTask: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    
    body('status')
      .optional()
      .isIn(['pending', 'in_progress', 'completed', 'cancelled'])
      .withMessage('Invalid status value'),
    
    body('due_date')
      .optional()
      .isISO8601()
      .withMessage('Invalid due date format'),
    
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Invalid priority value'),
    
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    
    body('is_recurring')
      .optional()
      .isBoolean()
      .withMessage('is_recurring must be a boolean'),
    
    body('recurrence_pattern')
      .optional()
      .isIn(['daily', 'weekly', 'monthly', 'yearly'])
      .withMessage('Invalid recurrence pattern'),
    
    body('recurrence_interval')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Recurrence interval must be a positive integer'),
    
    body('recurrence_end_date')
      .optional()
      .isISO8601()
      .withMessage('Invalid recurrence end date format')
  ],

  updateTask: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Invalid task ID'),
    
    body('title')
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    
    body('status')
      .optional()
      .isIn(['pending', 'in_progress', 'completed', 'cancelled'])
      .withMessage('Invalid status value'),
    
    body('due_date')
      .optional()
      .isISO8601()
      .withMessage('Invalid due date format'),
    
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Invalid priority value'),
    
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    
    body('is_recurring')
      .optional()
      .isBoolean()
      .withMessage('is_recurring must be a boolean'),
    
    body('recurrence_pattern')
      .optional()
      .isIn(['daily', 'weekly', 'monthly', 'yearly'])
      .withMessage('Invalid recurrence pattern'),
    
    body('recurrence_interval')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Recurrence interval must be a positive integer'),
    
    body('recurrence_end_date')
      .optional()
      .isISO8601()
      .withMessage('Invalid recurrence end date format')
  ],

  getTaskById: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Invalid task ID')
  ],

  getAllTasks: [
    query('keyword')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Search keyword must be at least 2 characters'),
    
    query('status')
      .optional()
      .isIn(['pending', 'in_progress', 'completed', 'cancelled'])
      .withMessage('Invalid status value'),
    
    query('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Invalid priority value'),
    
    query('tags')
      .optional()
      .matches(/^\d+(,\d+)*$/)
      .withMessage('Tags must be comma-separated numbers'),
    
    query('is_recurring')
      .optional()
      .isBoolean()
      .withMessage('is_recurring must be a boolean')
  ],

  deleteTask: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Invalid task ID')
  ],

  reorderTasks: [
    body('positions')
      .isArray()
      .withMessage('Positions must be an array')
      .notEmpty()
      .withMessage('Positions array cannot be empty'),
    
    body('positions.*.id')
      .isInt({ min: 1 })
      .withMessage('Invalid task ID in positions array'),
    
    body('positions.*.order')
      .isInt({ min: 0 })
      .withMessage('Order must be a non-negative integer')
  ]
};

module.exports = taskValidation; 