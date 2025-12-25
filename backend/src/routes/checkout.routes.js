const express = require("express");
const checkoutController = require("../controllers/checkout.controller");
const validate = require("../middleware/validation");
const { checkoutValidator } = require("../validators/checkout.validator");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Checkout endpoint - supports both authenticated and guest checkout
// authMiddleware() without required=true allows optional authentication
router.post(
  "/",
  authMiddleware(null, false), // Optional auth - doesn't require token but uses it if present
  checkoutValidator,
  validate,
  checkoutController.processCheckout
);

module.exports = router;

