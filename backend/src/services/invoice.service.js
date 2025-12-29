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

      // Calculate total and validate stock (but don't reduce it yet - will be reduced when shipped)
      let total = 0;
      for (const item of items) {
        const [rows] = await connection.query(
          "SELECT price, stock_quantity FROM products WHERE id = ? FOR UPDATE",
          [item.product_id]
        );
        const product = rows[0];

        if (!product) {
          throw new AppError(`Product with ID ${item.product_id} not found`, 404);
        }

        // Validate stock availability but don't reduce it yet
        if (product.stock_quantity < item.quantity) {
          throw new AppError(`Insufficient stock for product ID ${item.product_id}. Available: ${product.stock_quantity}, Required: ${item.quantity}`, 400);
        }

        total += Number(product.price) * item.quantity;
      }

      // Create invoice
      // Stock will be reduced when order status changes to "shipped"
      const [invoiceResult] = await connection.query(
        "INSERT INTO invoices (user_id, total_amount, status) VALUES (?, ?, 'pending')",
        [user_id, total]
      );

      const invoiceId = invoiceResult.insertId;

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
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Get current invoice status and items
      const [invoiceRows] = await connection.query(
        "SELECT status FROM invoices WHERE id = ?",
        [id]
      );
      
      if (invoiceRows.length === 0) {
        throw new AppError("Invoice not found", 404);
      }
      
      const oldStatus = invoiceRows[0].status;
      
      // Get invoice items
      const [items] = await connection.query(
        "SELECT product_id, quantity FROM invoice_items WHERE invoice_id = ?",
        [id]
      );

      // Handle stock changes based on status transition
      if (status === "shipped" && oldStatus !== "shipped") {
        // Check if stock was already reduced for this invoice
        const [existingStockHistory] = await connection.query(
          `SELECT SUM(quantity_change) as total_reduced 
           FROM stock_history 
           WHERE reference_type = 'invoice' AND reference_id = ? AND change_type = 'sale'`,
          [id]
        );
        
        const alreadyReduced = existingStockHistory[0]?.total_reduced || 0;
        
        // Reduce stock when shipping (only if not already reduced)
        for (const item of items) {
          const [productRows] = await connection.query(
            "SELECT stock_quantity FROM products WHERE id = ? FOR UPDATE",
            [item.product_id]
          );
          
          if (productRows.length === 0) {
            throw new AppError(`Product with ID ${item.product_id} not found`, 404);
          }
          
          const currentStock = productRows[0].stock_quantity;
          
          // Check if stock for this specific product was already reduced
          const [productStockHistory] = await connection.query(
            `SELECT SUM(quantity_change) as total_reduced 
             FROM stock_history 
             WHERE reference_type = 'invoice' AND reference_id = ? 
             AND product_id = ? AND change_type = 'sale'`,
            [id, item.product_id]
          );
          
          const productAlreadyReduced = Math.abs(productStockHistory[0]?.total_reduced || 0);
          
          if (productAlreadyReduced >= item.quantity) {
            // Stock was already reduced for this product, skip
            logger.info(`Stock already reduced for product ${item.product_id} in invoice ${id}`);
            continue;
          }
          
          const remainingToReduce = item.quantity - productAlreadyReduced;
          
          if (currentStock < remainingToReduce) {
            throw new AppError(`Insufficient stock for product ID ${item.product_id}. Available: ${currentStock}, Required: ${remainingToReduce}`, 400);
          }
          
          const newStock = currentStock - remainingToReduce;
          
          await connection.query(
            "UPDATE products SET stock_quantity = ? WHERE id = ?",
            [newStock, item.product_id]
          );
          
          // Record stock history
          await connection.query(
            `INSERT INTO stock_history 
             (product_id, user_id, change_type, quantity_change, previous_quantity, new_quantity, reason, reference_type, reference_id)
             VALUES (?, (SELECT user_id FROM invoices WHERE id = ?), 'sale', ?, ?, ?, 'Order shipped', 'invoice', ?)`,
            [item.product_id, id, -remainingToReduce, currentStock, newStock, id]
          );
          
          logger.info(`Stock reduced for product ${item.product_id}: ${currentStock} -> ${newStock} (Invoice ${id})`);
        }
      } else if (status === "cancelled" && (oldStatus === "paid" || oldStatus === "shipped")) {
        // Restore stock when cancelling a paid or shipped order
        for (const item of items) {
          const [productRows] = await connection.query(
            "SELECT stock_quantity FROM products WHERE id = ? FOR UPDATE",
            [item.product_id]
          );
          
          if (productRows.length === 0) {
            throw new AppError(`Product with ID ${item.product_id} not found`, 404);
          }
          
          const currentStock = productRows[0].stock_quantity;
          const newStock = currentStock + item.quantity;
          
          await connection.query(
            "UPDATE products SET stock_quantity = ? WHERE id = ?",
            [newStock, item.product_id]
          );
          
          // Record stock history
          await connection.query(
            `INSERT INTO stock_history 
             (product_id, user_id, change_type, quantity_change, previous_quantity, new_quantity, reason, reference_type, reference_id)
             VALUES (?, (SELECT user_id FROM invoices WHERE id = ?), 'adjustment', ?, ?, ?, 'Order cancelled', 'invoice', ?)`,
            [item.product_id, id, item.quantity, currentStock, newStock, id]
          );
          
          logger.info(`Stock restored for product ${item.product_id}: ${currentStock} -> ${newStock} (Invoice ${id} cancelled)`);
        }
      }

      // Update invoice status
      await connection.query("UPDATE invoices SET status = ? WHERE id = ?", [status, id]);

      await connection.commit();

      const invoice = await this.getInvoiceById(id);
      logger.info(`Invoice status updated: ID ${id} -> ${status} (from ${oldStatus})`);

      return invoice;
    } catch (error) {
      await connection.rollback();
      logger.error("Error updating invoice:", error);
      if (error.statusCode) throw error;
      throw new AppError("Failed to update invoice", 500);
    } finally {
      connection.release();
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
