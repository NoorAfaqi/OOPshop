const pool = require("../config/database");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../config/logger");

class InvoiceService {
  /**
   * Create invoice with items
   */
  async createInvoice(invoiceData) {
    const { user_id, items } = invoiceData;

    if (!user_id || !Array.isArray(items) || items.length === 0) {
      throw new AppError("user_id and items are required", 400);
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Calculate total and validate stock
      let total = 0;
      const stockChanges = [];
      for (const item of items) {
        const [rows] = await connection.query(
          "SELECT price, stock_quantity FROM products WHERE id = ? FOR UPDATE",
          [item.product_id]
        );
        const product = rows[0];

        if (!product) {
          throw new AppError(`Product with ID ${item.product_id} not found`, 404);
        }

        if (product.stock_quantity < item.quantity) {
          throw new AppError(`Insufficient stock for product ID ${item.product_id}`, 400);
        }

        total += Number(product.price) * item.quantity;

        // Update stock and record history
        const previousQuantity = product.stock_quantity;
        const newQuantity = previousQuantity - item.quantity;
        
        await connection.query(
          "UPDATE products SET stock_quantity = ? WHERE id = ?",
          [newQuantity, item.product_id]
        );

        // Store stock change for history recording after invoice creation
        stockChanges.push({
          product_id: item.product_id,
          user_id: user_id,
          quantity_change: -item.quantity,
          previous_quantity: previousQuantity,
          new_quantity: newQuantity,
        });
      }

      // Create invoice
      const [invoiceResult] = await connection.query(
        "INSERT INTO invoices (user_id, total_amount, status) VALUES (?, ?, 'pending')",
        [user_id, total]
      );

      const invoiceId = invoiceResult.insertId;

      // Record stock history with invoice reference
      for (const stockChange of stockChanges) {
        await connection.query(
          `INSERT INTO stock_history 
           (product_id, user_id, change_type, quantity_change, previous_quantity, new_quantity, reason, reference_type, reference_id)
           VALUES (?, ?, 'sale', ?, ?, ?, 'Invoice sale', 'invoice', ?)`,
          [stockChange.product_id, stockChange.user_id, stockChange.quantity_change, stockChange.previous_quantity, stockChange.new_quantity, invoiceId]
        );
      }

      // Create invoice items
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

      // Fetch the created invoice
      const invoice = await this.getInvoiceById(invoiceId);
      logger.info(`Invoice created: ID ${invoiceId} for user ${user_id}`);

      return invoice;
    } catch (error) {
      await connection.rollback();
      logger.error("Error creating invoice:", error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all invoices
   */
  async getAllInvoices() {
    try {
      const [rows] = await pool.query(
        `SELECT i.*, u.first_name, u.last_name, u.email
         FROM invoices i
         JOIN users u ON u.id = i.user_id
         ORDER BY i.created_at DESC`
      );
      return rows;
    } catch (error) {
      logger.error("Error fetching invoices:", error);
      throw new AppError("Failed to fetch invoices", 500);
    }
  }

  /**
   * Get invoice by ID with items
   */
  async getInvoiceById(id) {
    try {
      const [invoiceRows] = await pool.query(
        `SELECT i.*, u.first_name, u.last_name, u.email, u.phone,
                u.billing_street, u.billing_zip, u.billing_city, u.billing_country
         FROM invoices i
         JOIN users u ON u.id = i.user_id
         WHERE i.id = ?`,
        [id]
      );

      const invoice = invoiceRows[0];
      if (!invoice) {
        throw new AppError("Invoice not found", 404);
      }

      const [items] = await pool.query(
        `SELECT ii.*, p.name
         FROM invoice_items ii
         JOIN products p ON p.id = ii.product_id
         WHERE ii.invoice_id = ?`,
        [id]
      );

      return { ...invoice, items };
    } catch (error) {
      if (error.statusCode === 404) throw error;
      logger.error("Error fetching invoice:", error);
      throw new AppError("Failed to fetch invoice", 500);
    }
  }

  /**
   * Update invoice status
   */
  async updateInvoiceStatus(id, status) {
    try {
      await pool.query("UPDATE invoices SET status = ? WHERE id = ?", [status, id]);

      const invoice = await this.getInvoiceById(id);
      logger.info(`Invoice status updated: ID ${id} -> ${status}`);

      return invoice;
    } catch (error) {
      logger.error("Error updating invoice:", error);
      throw new AppError("Failed to update invoice", 500);
    }
  }

  /**
   * Delete invoice
   */
  async deleteInvoice(id) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      await connection.query("DELETE FROM invoice_items WHERE invoice_id = ?", [id]);
      await connection.query("DELETE FROM invoices WHERE id = ?", [id]);

      await connection.commit();
      logger.info(`Invoice deleted: ID ${id}`);

      return { message: "Invoice deleted successfully" };
    } catch (error) {
      await connection.rollback();
      logger.error("Error deleting invoice:", error);
      throw new AppError("Failed to delete invoice", 500);
    } finally {
      connection.release();
    }
  }
}

module.exports = new InvoiceService();
