const express = require("express");
const paymentController = require("../controllers/payment.controller");
const validate = require("../middleware/validation");
const { paypalCallbackValidator } = require("../validators/payment.validator");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Payment routes
router.get("/", authMiddleware.requireAuth(), paymentController.getAllPayments);
router.post("/paypal/callback", paypalCallbackValidator, validate, paymentController.processPayPalCallback);

// PayPal order creation and capture - PUBLIC (no auth required)
// These routes are explicitly public to allow guest checkout
router.post("/paypal/create-order", authMiddleware(null, false), paymentController.createPayPalOrder);
router.post("/paypal/capture", authMiddleware(null, false), paymentController.capturePayPalPayment);

module.exports = router;
