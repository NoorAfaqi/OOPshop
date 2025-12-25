const invoiceService = require("../services/invoice.service");
const { successResponse } = require("../utils/response");
const { asyncHandler } = require("../middleware/errorHandler");

const createInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.createInvoice(req.body);
  successResponse(res, invoice, "Invoice created successfully", 201);
});

const getAllInvoices = asyncHandler(async (req, res) => {
  // Customers can only see their own invoices
  if (req.user.role === 'customer') {
    const db = require("../config/database");
    const [invoices] = await db.query(
      `SELECT i.*, 
        GROUP_CONCAT(CONCAT(p.name, ' x', ii.quantity) SEPARATOR ', ') AS items
       FROM invoices i
       LEFT JOIN invoice_items ii ON ii.invoice_id = i.id
       LEFT JOIN products p ON p.id = ii.product_id
       WHERE i.user_id = ?
       GROUP BY i.id
       ORDER BY i.created_at DESC`,
      [req.user.id]
    );
    return successResponse(res, invoices, "Invoices fetched successfully");
  }
  
  // Admin/Manager can see all invoices
  const invoices = await invoiceService.getAllInvoices();
  successResponse(res, invoices, "Invoices fetched successfully");
});

const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.getInvoiceById(req.params.id);
  
  // Check if user is customer and invoice belongs to them
  if (req.user.role === 'customer' && invoice.user_id !== req.user.id) {
    return res.status(403).json({ 
      status: "error",
      message: "Access denied. You can only view your own invoices." 
    });
  }
  
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
