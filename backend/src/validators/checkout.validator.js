const { body } = require("express-validator");

const checkoutValidator = [
  body("email")
    .optional()
    .isEmail()
    .withMessage("Valid email is required if provided"),
  body("first_name")
    .notEmpty()
    .withMessage("First name is required")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("First name must be between 1 and 100 characters"),
  body("last_name")
    .notEmpty()
    .withMessage("Last name is required")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Last name must be between 1 and 100 characters"),
  body("phone")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Phone must not exceed 50 characters"),
  body("billing_street")
    .notEmpty()
    .withMessage("Billing street is required")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Billing street must be between 1 and 255 characters"),
  body("billing_zip")
    .notEmpty()
    .withMessage("Billing ZIP code is required")
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage("Billing ZIP must be between 1 and 20 characters"),
  body("billing_city")
    .notEmpty()
    .withMessage("Billing city is required")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Billing city must be between 1 and 100 characters"),
  body("billing_country")
    .notEmpty()
    .withMessage("Billing country is required")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Billing country must be between 2 and 100 characters"),
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

module.exports = {
  checkoutValidator,
};
