const { body } = require("express-validator");

const checkoutValidator = [
  body("user_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("User ID must be a valid integer"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Valid email is required if provided"),
  body("first_name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("First name must be between 1 and 100 characters")
    .custom((value, { req }) => {
      // Required if user_id is not provided
      if (!req.body.user_id && !value) {
        throw new Error("First name is required for guest checkout");
      }
      return true;
    }),
  body("last_name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Last name must be between 1 and 100 characters")
    .custom((value, { req }) => {
      // Required if user_id is not provided
      if (!req.body.user_id && !value) {
        throw new Error("Last name is required for guest checkout");
      }
      return true;
    }),
  body("phone")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Phone must not exceed 50 characters"),
  body("billing_street")
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Billing street must be between 1 and 255 characters"),
  body("billing_zip")
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage("Billing ZIP must be between 1 and 20 characters"),
  body("billing_city")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Billing city must be between 1 and 100 characters"),
  body("billing_country")
    .optional()
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
