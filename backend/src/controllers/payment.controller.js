const paymentService = require("../services/payment.service");
const paypalService = require("../services/paypal.service");
const { successResponse } = require("../utils/response");
const { asyncHandler } = require("../middleware/errorHandler");

const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await paymentService.getAllPayments();
  successResponse(res, payments, "Payments fetched successfully");
});

const processPayPalCallback = asyncHandler(async (req, res) => {
  const result = await paymentService.processPayPalCallback(req.body);
  successResponse(res, result, "PayPal callback processed successfully");
});

/**
 * Create PayPal order
 * POST /payments/paypal/create-order
 */
const createPayPalOrder = asyncHandler(async (req, res) => {
  const { invoice_id, amount, currency, description } = req.body;

  if (!invoice_id || !amount) {
    return res.status(400).json({
      status: "error",
      message: "invoice_id and amount are required",
    });
  }

  const order = await paypalService.createOrder({
    invoice_id,
    amount,
    currency,
    description,
  });

  successResponse(res, order, "PayPal order created successfully");
});

/**
 * Capture PayPal payment
 * POST /payments/paypal/capture
 */
const capturePayPalPayment = asyncHandler(async (req, res) => {
  const { orderId, invoice_id, user_id } = req.body;

  if (!orderId || !invoice_id) {
    return res.status(400).json({
      status: "error",
      message: "orderId and invoice_id are required",
    });
  }

  // If user_id not provided, get it from invoice
  let userId = user_id;
  if (!userId) {
    const pool = require("../config/database");
    const [invoices] = await pool.query(
      "SELECT user_id FROM invoices WHERE id = ?",
      [invoice_id]
    );
    if (invoices.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Invoice not found",
      });
    }
    userId = invoices[0].user_id;
  }

  // Capture payment from PayPal
  const capture = await paypalService.capturePayment(orderId);

  // Check if capture was successful
  if (capture.status !== "COMPLETED") {
    return res.status(400).json({
      status: "error",
      message: "Payment capture was not completed",
      data: capture,
    });
  }

  // Get payment details from capture
  const purchaseUnit = capture.purchase_units[0];
  const payment = purchaseUnit.payments.captures[0];
  const amount = parseFloat(payment.amount.value);
  const transactionId = payment.id;

  // Record payment in database
  const paymentRecord = await paymentService.recordPayPalPayment({
    invoice_id,
    user_id: userId,
    amount,
    transaction_id: transactionId,
    status: "completed",
  });

  successResponse(res, {
    capture,
    payment: paymentRecord,
  }, "PayPal payment captured successfully");
});

module.exports = {
  getAllPayments,
  processPayPalCallback,
  createPayPalOrder,
  capturePayPalPayment,
};
