const { validationResult } = require('express-validator');
const { AppError } = require('../utils/errorHandler');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new AppError('Invalid input data', 400);
    error.errors = errors.array();
    return next(error);
  }
  next();
};

module.exports = validateRequest; 