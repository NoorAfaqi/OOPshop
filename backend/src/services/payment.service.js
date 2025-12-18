const pool = require("../config/database");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../config/logger");

class PaymentService {
  /**
   * Get all payments
   */
  async getAllPayments() {
    try {
      const [rows] = await pool.query(
        `SELECT p.*, u.first_name, u.last_name, u.email, i.total_amount
         FROM payments p
         JOIN users u ON u.id = p.user_id
         JOIN invoices i ON i.id = p.invoice_id
         ORDER BY p.created_at DESC`
      );
      return rows;
    } catch (error) {
      logger.error("Error fetching payments:", error);
      throw new AppError("Failed to fetch payments", 500);
    }
  }

  /**
   * Process PayPal callback
   */
  async processPayPalCallback(callbackData) {
    const { invoice_id, user_id, amount, status, transaction_id } = callbackData;

    if (!invoice_id || !user_id || !amount || !status) {
      throw new AppError("invoice_id, user_id, amount, status are required", 400);
    }

    try {
      await pool.query(
        `INSERT INTO payments (invoice_id, user_id, amount, method, status, paypal_transaction_id)
         VALUES (?, ?, ?, 'paypal', ?, ?)`,
        [invoice_id, user_id, amount, status, transaction_id || null]
      );

      if (status === "completed") {
        await pool.query("UPDATE invoices SET status = 'paid' WHERE id = ?", [invoice_id]);
      }

      logger.info(`PayPal payment processed: Invoice ${invoice_id}, Status: ${status}`);

      return { ok: true };
    } catch (error) {
      logger.error("Error processing PayPal callback:", error);
      throw new AppError("Failed to process PayPal callback", 500);
    }
  }
}

module.exports = new PaymentService();
