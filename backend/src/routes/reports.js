const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  const { from, to } = req.query || {};
  const hasRange = from && to;
  const rangeClause = hasRange ? "WHERE created_at BETWEEN ? AND ?" : "";
  const params = hasRange ? [from, to] : [];

  try {
    const [[{ total_sales }]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS total_sales FROM invoices ${rangeClause}`,
      params
    );

    const [[{ avg_purchase }]] = await pool.query(
      `SELECT COALESCE(AVG(total_amount), 0) AS avg_purchase FROM invoices ${rangeClause}`,
      params
    );

    const [mostPurchasedProducts] = await pool.query(
      `SELECT p.id, p.name, SUM(ii.quantity) AS total_quantity
       FROM invoice_items ii
       JOIN invoices i ON i.id = ii.invoice_id
       JOIN products p ON p.id = ii.product_id
       ${hasRange ? "WHERE i.created_at BETWEEN ? AND ?" : ""}
       GROUP BY p.id, p.name
       ORDER BY total_quantity DESC
       LIMIT 10`,
      hasRange ? params : []
    );

    const [paymentValues] = await pool.query(
      `SELECT amount FROM payments ${
        hasRange ? "WHERE created_at BETWEEN ? AND ?" : ""
      }`,
      hasRange ? params : []
    );
    const amounts = paymentValues
      .map((p) => Number(p.amount))
      .sort((a, b) => a - b);
    let median_payment = 0;
    if (amounts.length) {
      const mid = Math.floor(amounts.length / 2);
      median_payment =
        amounts.length % 2 === 0
          ? (amounts[mid - 1] + amounts[mid]) / 2
          : amounts[mid];
    }

    const [salesTrend] = await pool.query(
      `SELECT DATE(created_at) AS date, SUM(total_amount) AS total
       FROM invoices
       ${rangeClause}
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at)`,
      params
    );

    return res.json({
      total_sales,
      avg_purchase,
      most_purchased_products: mostPurchasedProducts,
      median_payment,
      sales_trend: salesTrend,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to compute reports" });
  }
});

module.exports = router;


