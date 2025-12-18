const { body } = require("express-validator");

const paypalCallbackValidator = [
  body("invoice_id")
    .isInt({ min: 1 })
    .withMessage("Valid invoice ID is required"),
  body("user_id")
    .isInt({ min: 1 })
    .withMessage("Valid user ID is required"),
  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be a positive number"),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["pending", "completed", "failed"])
    .withMessage("Status must be one of: pending, completed, failed"),
  body("transaction_id")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Transaction ID must not exceed 255 characters"),
];

module.exports = {
  paypalCallbackValidator,
};
