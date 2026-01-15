const { body } = require("express-validator");

const loginValidator = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const registerValidator = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("first_name")
    .notEmpty()
    .trim()
    .withMessage("First name is required"),
  body("last_name")
    .notEmpty()
    .trim()
    .withMessage("Last name is required"),
  body("role")
    .optional()
    .isIn(["customer", "manager", "admin"])
    .withMessage("Role must be customer, manager, or admin"),
];

module.exports = {
  loginValidator,
  registerValidator,
};

