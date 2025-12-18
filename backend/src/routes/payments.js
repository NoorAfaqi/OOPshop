const express = require("express");
const paymentController = require("../controllers/payment.controller");
const validate = require("../middleware/validation");
const { paypalCallbackValidator } = require("../validators/payment.validator");

const router = express.Router();

// Payment routes
router.get("/", paymentController.getAllPayments);
router.post("/paypal/callback", paypalCallbackValidator, validate, paymentController.processPayPalCallback);

module.exports = router;
