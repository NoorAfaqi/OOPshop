const express = require("express");
const pool = require("../db");

const router = express.Router();

// Create invoice with items
router.post("/", async (req, res) => {
  const { customer_id, items } = req.body || {};

  if (!customer_id || !Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ message: "customer_id and items are required" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Calculate total
    let total = 0;
    for (const item of items) {
      const [rows] = await connection.query(
        "SELECT price, stock_quantity FROM products WHERE id = ? FOR UPDATE",
        [item.product_id]
      );
      const product = rows[0];
      if (!product) {
        throw new Error("Product not found");
      }
      if (product.stock_quantity < item.quantity) {
        throw new Error("Insufficient stock");
      }

      total += Number(product.price) * item.quantity;

      await connection.query(
        "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
        [item.quantity, item.product_id]
      );
    }

    const [invoiceResult] = await connection.query(
      "INSERT INTO invoices (customer_id, total_amount, status) VALUES (?, ?, 'pending')",
      [customer_id, total]
    );

    const invoiceId = invoiceResult.insertId;

    for (const item of items) {
      const [rows] = await connection.query(
        "SELECT price FROM products WHERE id = ?",
        [item.product_id]
      );
      const product = rows[0];
      await connection.query(
        "INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
        [invoiceId, item.product_id, item.quantity, product.price]
      );
    }

    await connection.commit();

    const [invoiceRows] = await pool.query(
      "SELECT * FROM invoices WHERE id = ?",
      [invoiceId]
    );
    return res.status(201).json(invoiceRows[0]);
  } catch (err) {
    await connection.rollback();
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: err.message || "Failed to create invoice" });
  } finally {
    connection.release();
  }
});

// List invoices
router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.*, c.first_name, c.last_name
       FROM invoices i
       JOIN customers c ON c.id = i.customer_id
       ORDER BY i.created_at DESC`
    );
    return res.json(rows);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to list invoices" });
  }
});

// Invoice details
router.get("/:id", async (req, res) => {
  try {
    const [invoiceRows] = await pool.query(
      `SELECT i.*, c.first_name, c.last_name
       FROM invoices i
       JOIN customers c ON c.id = i.customer_id
       WHERE i.id = ?`,
      [req.params.id]
    );
    const invoice = invoiceRows[0];
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const [items] = await pool.query(
      `SELECT ii.*, p.name
       FROM invoice_items ii
       JOIN products p ON p.id = ii.product_id
       WHERE ii.invoice_id = ?`,
      [req.params.id]
    );

    return res.json({ ...invoice, items });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to get invoice" });
  }
});

// Update invoice status only (simplified)
router.put("/:id", async (req, res) => {
  const { status } = req.body || {};
  try {
    await pool.query("UPDATE invoices SET status = ? WHERE id = ?", [
      status,
      req.params.id,
    ]);
    const [rows] = await pool.query("SELECT * FROM invoices WHERE id = ?", [
      req.params.id,
    ]);
    return res.json(rows[0]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to update invoice" });
  }
});

// Delete invoice
router.delete("/:id", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("DELETE FROM invoice_items WHERE invoice_id = ?", [
      req.params.id,
    ]);
    await connection.query("DELETE FROM invoices WHERE id = ?", [
      req.params.id,
    ]);
    await connection.commit();
    return res.status(204).end();
  } catch (err) {
    await connection.rollback();
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to delete invoice" });
  } finally {
    connection.release();
  }
});

module.exports = router;


