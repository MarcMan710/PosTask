const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format validation errors
    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg
    }));

    throw new ValidationError(formattedErrors);
  };
};

module.exports = validate; 