const paymentService = require("../services/payment.service");
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

module.exports = {
  getAllPayments,
  processPayPalCallback,
};
