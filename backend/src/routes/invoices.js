const express = require("express");
const invoiceController = require("../controllers/invoice.controller");
const validate = require("../middleware/validation");
const {
  createInvoiceValidator,
  updateInvoiceValidator,
  getInvoiceValidator,
} = require("../validators/invoice.validator");

const router = express.Router();

// Invoice routes
router.post("/", createInvoiceValidator, validate, invoiceController.createInvoice);
router.get("/", invoiceController.getAllInvoices);
router.get("/:id", getInvoiceValidator, validate, invoiceController.getInvoiceById);
router.put("/:id", updateInvoiceValidator, validate, invoiceController.updateInvoiceStatus);
router.delete("/:id", getInvoiceValidator, validate, invoiceController.deleteInvoice);

module.exports = router;
