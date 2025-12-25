const express = require("express");
const authService = require("../services/auth.service");
const { successResponse } = require("../utils/response");
const { asyncHandler } = require("../middleware/errorHandler");
const authMiddleware = require("../middleware/auth");
const db = require("../config/database");

const router = express.Router();

/**
 * Get current user's profile
 * GET /account/me
 */
router.get(
  "/me",
  authMiddleware.requireAuth(),
  asyncHandler(async (req, res) => {
    const user = await authService.getUserById(req.user.id);
    successResponse(res, user, "Profile fetched successfully");
  })
);

/**
 * Update current user's profile
 * PUT /account/me
 */
router.put(
  "/me",
  authMiddleware.requireAuth(),
  asyncHandler(async (req, res) => {
    const user = await authService.updateUser(req.user.id, req.body);
    successResponse(res, user, "Profile updated successfully");
  })
);

/**
 * Get current user's orders (all invoices)
 * GET /account/orders
 */
router.get(
  "/orders",
  authMiddleware.requireAuth(),
  asyncHandler(async (req, res) => {
    const [invoices] = await db.query(
      `SELECT 
        i.*, 
        GROUP_CONCAT(CONCAT(p.name, ' x', ii.quantity) SEPARATOR ', ') AS items,
        COUNT(ii.id) AS item_count
       FROM invoices i
       LEFT JOIN invoice_items ii ON ii.invoice_id = i.id
       LEFT JOIN products p ON p.id = ii.product_id
       WHERE i.user_id = ?
       GROUP BY i.id
       ORDER BY i.created_at DESC`,
      [req.user.id]
    );
    
    successResponse(res, invoices, "Orders fetched successfully");
  })
);

/**
 * Get current user's pending/current orders
 * GET /account/orders/current
 */
router.get(
  "/orders/current",
  authMiddleware.requireAuth(),
  asyncHandler(async (req, res) => {
    const [invoices] = await db.query(
      `SELECT 
        i.*, 
        GROUP_CONCAT(CONCAT(p.name, ' x', ii.quantity) SEPARATOR ', ') AS items,
        COUNT(ii.id) AS item_count
       FROM invoices i
       LEFT JOIN invoice_items ii ON ii.invoice_id = i.id
       LEFT JOIN products p ON p.id = ii.product_id
       WHERE i.user_id = ? 
         AND i.status IN ('pending', 'processing')
       GROUP BY i.id
       ORDER BY i.created_at DESC`,
      [req.user.id]
    );
    
    successResponse(res, invoices, "Current orders fetched successfully");
  })
);

/**
 * Get specific order by ID (must belong to current user)
 * GET /account/orders/:id
 */
router.get(
  "/orders/:id",
  authMiddleware.requireAuth(),
  asyncHandler(async (req, res) => {
    const [invoices] = await db.query(
      `SELECT 
        i.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.billing_street,
        u.billing_zip,
        u.billing_city,
        u.billing_country
       FROM invoices i
       JOIN users u ON u.id = i.user_id
       WHERE i.id = ? AND i.user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (invoices.length === 0) {
      return res.status(404).json({ 
        status: "error",
        message: "Order not found or access denied" 
      });
    }

    const invoice = invoices[0];

    // Get invoice items
    const [items] = await db.query(
      `SELECT 
        ii.*,
        p.name,
        p.brand,
        p.image_url,
        p.category
       FROM invoice_items ii
       JOIN products p ON p.id = ii.product_id
       WHERE ii.invoice_id = ?
       ORDER BY ii.id`,
      [req.params.id]
    );

    invoice.items = items;

    successResponse(res, invoice, "Order fetched successfully");
  })
);

/**
 * Get current user's payment history
 * GET /account/payments
 */
router.get(
  "/payments",
  authMiddleware.requireAuth(),
  asyncHandler(async (req, res) => {
    const [payments] = await db.query(
      `SELECT 
        p.*,
        i.total_amount,
        i.status AS invoice_status
       FROM payments p
       JOIN invoices i ON i.id = p.invoice_id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    
    successResponse(res, payments, "Payments fetched successfully");
  })
);

/**
 * Get account statistics/summary
 * GET /account/stats
 */
router.get(
  "/stats",
  authMiddleware.requireAuth(),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Get total orders count
    const [orderCount] = await db.query(
      "SELECT COUNT(*) as total FROM invoices WHERE user_id = ?",
      [userId]
    );

    // Get total spent
    const [totalSpent] = await db.query(
      "SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices WHERE user_id = ? AND status = 'paid'",
      [userId]
    );

    // Get pending orders count
    const [pendingCount] = await db.query(
      "SELECT COUNT(*) as total FROM invoices WHERE user_id = ? AND status IN ('pending', 'processing')",
      [userId]
    );

    // Get recent order
    const [recentOrder] = await db.query(
      "SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
      [userId]
    );

    const stats = {
      total_orders: orderCount[0]?.total || 0,
      total_spent: parseFloat(totalSpent[0]?.total || 0),
      pending_orders: pendingCount[0]?.total || 0,
      recent_order: recentOrder[0] || null,
    };

    successResponse(res, stats, "Account statistics fetched successfully");
  })
);

module.exports = router;

