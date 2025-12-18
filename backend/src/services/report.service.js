const pool = require("../config/database");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../config/logger");

class ReportService {
  /**
   * Generate comprehensive sales report
   */
  async generateReport(filters = {}) {
    try {
      const { from, to } = filters;
      const hasRange = from && to;
      const rangeClause = hasRange ? "WHERE created_at BETWEEN ? AND ?" : "";
      const params = hasRange ? [from, to] : [];

      // Validate date format if provided
      if (hasRange) {
        const fromDate = new Date(from);
        const toDate = new Date(to);
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
          throw new AppError("Invalid date format. Use ISO 8601 format (YYYY-MM-DD)", 400);
        }
      }

      // Total sales
      const [[{ total_sales }]] = await pool.query(
        `SELECT COALESCE(SUM(total_amount), 0) AS total_sales FROM invoices ${rangeClause}`,
        params
      );

      // Average purchase
      const [[{ avg_purchase }]] = await pool.query(
        `SELECT COALESCE(AVG(total_amount), 0) AS avg_purchase FROM invoices ${rangeClause}`,
        params
      );

      // Most purchased products
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

      // Median payment calculation
      const [paymentValues] = await pool.query(
        `SELECT amount FROM payments ${hasRange ? "WHERE created_at BETWEEN ? AND ?" : ""}`,
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

      // Sales trend by date
      const [salesTrend] = await pool.query(
        `SELECT DATE(created_at) AS date, SUM(total_amount) AS total
         FROM invoices
         ${rangeClause}
         GROUP BY DATE(created_at)
         ORDER BY DATE(created_at)`,
        params
      );

      logger.info(`Report generated: ${hasRange ? `${from} to ${to}` : "all time"}`);

      return {
        total_sales,
        avg_purchase,
        most_purchased_products: mostPurchasedProducts,
        median_payment,
        sales_trend: salesTrend,
      };
    } catch (error) {
      if (error.statusCode === 400) throw error;
      logger.error("Error generating report:", error);
      throw new AppError("Failed to generate report", 500);
    }
  }
}

module.exports = new ReportService();
