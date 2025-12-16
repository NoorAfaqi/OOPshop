const express = require("express");
const pool = require("../db");

const router = express.Router();

// List payments
router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.first_name, c.last_name, i.total_amount
       FROM payments p
       JOIN customers c ON c.id = p.customer_id
       JOIN invoices i ON i.id = p.invoice_id
       ORDER BY p.created_at DESC`
    );
    return res.json(rows);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to list payments" });
  }
});

// Simplified PayPal callback placeholder
router.post("/paypal/callback", async (req, res) => {
  const { invoice_id, customer_id, amount, status, transaction_id } =
    req.body || {};

  if (!invoice_id || !customer_id || !amount || !status) {
    return res
      .status(400)
      .json({ message: "invoice_id, customer_id, amount, status required" });
  }

  try {
    await pool.query(
      `INSERT INTO payments (invoice_id, customer_id, amount, method, status, paypal_transaction_id)
       VALUES (?, ?, ?, 'paypal', ?, ?)`,
      [invoice_id, customer_id, amount, status, transaction_id || null]
    );

    if (status === "completed") {
      await pool.query("UPDATE invoices SET status = 'paid' WHERE id = ?", [
        invoice_id,
      ]);
    }

    return res.json({ ok: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res
      .status(500)
      .json({ message: "Failed to handle PayPal callback" });
  }
});

module.exports = router;


