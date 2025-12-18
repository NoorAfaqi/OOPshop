const { validationResult } = require("express-validator");
const logger = require("../config/logger");

/**
 * Middleware to validate request using express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.warn("Validation failed:", {
      path: req.path,
      errors: errors.array(),
    });
    
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  
  next();
};

module.exports = validate;

