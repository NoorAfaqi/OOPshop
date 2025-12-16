const express = require("express");
const pool = require("../db");

const router = express.Router();

// Create customer
router.post("/", async (req, res) => {
  const {
    first_name,
    last_name,
    phone,
    billing_street,
    billing_zip,
    billing_city,
    billing_country,
  } = req.body || {};

  try {
    const [result] = await pool.query(
      `INSERT INTO customers
       (first_name, last_name, phone, billing_street, billing_zip, billing_city, billing_country)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        phone,
        billing_street,
        billing_zip,
        billing_city,
        billing_country,
      ]
    );

    const [rows] = await pool.query("SELECT * FROM customers WHERE id = ?", [
      result.insertId,
    ]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to create customer" });
  }
});

// List customers
router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM customers ORDER BY created_at DESC"
    );
    return res.json(rows);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to list customers" });
  }
});

// Get single customer
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM customers WHERE id = ?", [
      req.params.id,
    ]);
    if (!rows[0]) {
      return res.status(404).json({ message: "Customer not found" });
    }
    return res.json(rows[0]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to get customer" });
  }
});

// Update customer
router.put("/:id", async (req, res) => {
  const {
    first_name,
    last_name,
    phone,
    billing_street,
    billing_zip,
    billing_city,
    billing_country,
  } = req.body || {};

  try {
    await pool.query(
      `UPDATE customers SET
        first_name = ?, last_name = ?, phone = ?, billing_street = ?, billing_zip = ?, billing_city = ?, billing_country = ?
       WHERE id = ?`,
      [
        first_name,
        last_name,
        phone,
        billing_street,
        billing_zip,
        billing_city,
        billing_country,
        req.params.id,
      ]
    );

    const [rows] = await pool.query("SELECT * FROM customers WHERE id = ?", [
      req.params.id,
    ]);
    return res.json(rows[0]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to update customer" });
  }
});

// Delete customer
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM customers WHERE id = ?", [req.params.id]);
    return res.status(204).end();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to delete customer" });
  }
});

// Purchase history
router.get("/:id/purchases", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.*, GROUP_CONCAT(CONCAT(p.name, ' x', ii.quantity) SEPARATOR ', ') AS items
       FROM invoices i
       JOIN invoice_items ii ON ii.invoice_id = i.id
       JOIN products p ON p.id = ii.product_id
       WHERE i.customer_id = ?
       GROUP BY i.id
       ORDER BY i.created_at DESC`,
      [req.params.id]
    );
    return res.json(rows);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res
      .status(500)
      .json({ message: "Failed to fetch purchase history" });
  }
});

// Payment history
router.get("/:id/payments", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM payments WHERE customer_id = ? ORDER BY created_at DESC",
      [req.params.id]
    );
    return res.json(rows);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res
      .status(500)
      .json({ message: "Failed to fetch payment history" });
  }
});

module.exports = router;


