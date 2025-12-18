const invoiceService = require("../services/invoice.service");
const { successResponse } = require("../utils/response");
const { asyncHandler } = require("../middleware/errorHandler");

const createInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.createInvoice(req.body);
  successResponse(res, invoice, "Invoice created successfully", 201);
});

const getAllInvoices = asyncHandler(async (req, res) => {
  const invoices = await invoiceService.getAllInvoices();
  successResponse(res, invoices, "Invoices fetched successfully");
});

const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.getInvoiceById(req.params.id);
  successResponse(res, invoice, "Invoice fetched successfully");
});

const updateInvoiceStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const invoice = await invoiceService.updateInvoiceStatus(req.params.id, status);
  successResponse(res, invoice, "Invoice updated successfully");
});

const deleteInvoice = asyncHandler(async (req, res) => {
  await invoiceService.deleteInvoice(req.params.id);
  successResponse(res, null, "Invoice deleted successfully", 204);
});

module.exports = {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  deleteInvoice,
};
