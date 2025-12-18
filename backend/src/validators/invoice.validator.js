const { body, param } = require("express-validator");

const createInvoiceValidator = [
  body("user_id")
    .isInt({ min: 1 })
    .withMessage("Valid user ID is required"),
  body("items")
    .isArray({ min: 1 })
    .withMessage("Items must be a non-empty array"),
  body("items.*.product_id")
    .isInt({ min: 1 })
    .withMessage("Each item must have a valid product ID"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Each item must have a quantity of at least 1"),
];

const updateInvoiceValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid invoice ID"),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["pending", "paid", "cancelled"])
    .withMessage("Status must be one of: pending, paid, cancelled"),
];

const getInvoiceValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid invoice ID"),
];

module.exports = {
  createInvoiceValidator,
  updateInvoiceValidator,
  getInvoiceValidator,
};
