const express = require("express");
const authService = require("../services/auth.service");
const { successResponse } = require("../utils/response");
const { asyncHandler } = require("../middleware/errorHandler");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

/**
 * Get all users (admin/manager only)
 */
router.get(
  "/",
  authMiddleware.requireAuth(),
  asyncHandler(async (req, res) => {
    // Only admin and manager can view all users
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    const [users] = await require("../config/database").query(
      `SELECT id, email, first_name, last_name, phone, role, is_active, 
       billing_street, billing_zip, billing_city, billing_country, 
       created_at FROM users ORDER BY created_at DESC`
    );
    successResponse(res, users, "Users fetched successfully");
  })
);

/**
 * Create new user (admin/manager only)
 */
router.post(
  "/",
  authMiddleware.requireAuth(),
  asyncHandler(async (req, res) => {
    // Only admin and manager can create users
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    const user = await authService.createUser(req.body);
    successResponse(res, user, "User created successfully", 201);
  })
);

/**
 * Get user by ID
 */
router.get(
  "/:id",
  authMiddleware.requireAuth(),
  asyncHandler(async (req, res) => {
    // Users can only view their own profile unless they're admin/manager
    if (!['admin', 'manager'].includes(req.user.role) && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ message: "Access denied" });
    }
    const user = await authService.getUserById(req.params.id);
    successResponse(res, user, "User fetched successfully");
  })
);

/**
 * Update user
 */
router.put(
  "/:id",
  authMiddleware.requireAuth(),
  asyncHandler(async (req, res) => {
    // Users can only update their own profile unless they're admin/manager
    if (!['admin', 'manager'].includes(req.user.role) && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ message: "Access denied" });
    }
    const user = await authService.updateUser(req.params.id, req.body);
    successResponse(res, user, "User updated successfully");
  })
);

/**
 * Get user's invoices
 */
router.get(
  "/:id/invoices",
  authMiddleware.requireAuth(),
  asyncHandler(async (req, res) => {
    // Users can only view their own invoices unless they're admin/manager
    if (!['admin', 'manager'].includes(req.user.role) && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const [invoices] = await require("../config/database").query(
      `SELECT i.*, GROUP_CONCAT(CONCAT(p.name, ' x', ii.quantity) SEPARATOR ', ') AS items
       FROM invoices i
       JOIN invoice_items ii ON ii.invoice_id = i.id
       JOIN products p ON p.id = ii.product_id
       WHERE i.user_id = ?
       GROUP BY i.id
       ORDER BY i.created_at DESC`,
      [req.params.id]
    );
    
    successResponse(res, invoices, "Invoices fetched successfully");
  })
);

/**
 * Get user's payments
 */
router.get(
  "/:id/payments",
  authMiddleware.requireAuth(),
  asyncHandler(async (req, res) => {
    // Users can only view their own payments unless they're admin/manager
    if (!['admin', 'manager'].includes(req.user.role) && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const [payments] = await require("../config/database").query(
      "SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC",
      [req.params.id]
    );
    
    successResponse(res, payments, "Payments fetched successfully");
  })
);

module.exports = router;
