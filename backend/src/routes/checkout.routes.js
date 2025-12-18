const express = require("express");
const checkoutController = require("../controllers/checkout.controller");
const validate = require("../middleware/validation");
const { checkoutValidator } = require("../validators/checkout.validator");

const router = express.Router();

// Public checkout endpoint
router.post(
  "/",
  checkoutValidator,
  validate,
  checkoutController.processCheckout
);

module.exports = router;

