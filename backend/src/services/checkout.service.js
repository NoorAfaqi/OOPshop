const pool = require("../config/database");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../config/logger");

class CheckoutService {
  /**
   * Process checkout - create/update user and invoice with items
   */
  async processCheckout(checkoutData) {
    const {
      user_id, // Provided when user is authenticated
      email,
      first_name,
      last_name,
      phone,
      billing_street,
      billing_zip,
      billing_city,
      billing_country,
      items,
    } = checkoutData;
    
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      let userId;
      
      // If user_id is provided (authenticated user), use it directly
      if (user_id) {
        userId = user_id;
        // Optionally update billing info if provided
        if (billing_street || billing_zip || billing_city || billing_country) {
          await connection.query(
            `UPDATE users SET 
              billing_street = COALESCE(?, billing_street),
              billing_zip = COALESCE(?, billing_zip),
              billing_city = COALESCE(?, billing_city),
              billing_country = COALESCE(?, billing_country)
             WHERE id = ?`,
            [billing_street || null, billing_zip || null, billing_city || null, billing_country || null, userId]
          );
        }
      } else if (email) {
        // Check if user already exists by email
        const [existingUsers] = await connection.query(
          "SELECT id FROM users WHERE email = ?",
          [email]
        );
        
        if (existingUsers.length > 0) {
          userId = existingUsers[0].id;
          // Update billing info
          await connection.query(
            `UPDATE users SET 
              first_name = ?, last_name = ?, phone = ?,
              billing_street = ?, billing_zip = ?, billing_city = ?, billing_country = ?
             WHERE id = ?`,
            [first_name, last_name, phone || null, billing_street, billing_zip, billing_city, billing_country, userId]
          );
        } else {
          // Create new customer user (no password for guest checkout)
          const [userResult] = await connection.query(
            `INSERT INTO users
             (email, first_name, last_name, phone, role, billing_street, billing_zip, billing_city, billing_country)
             VALUES (?, ?, ?, ?, 'customer', ?, ?, ?, ?)`,
            [email, first_name, last_name, phone || null, billing_street, billing_zip, billing_city, billing_country]
          );
          userId = userResult.insertId;
        }
      } else {
        // Guest checkout (no email) - create guest user
        const [userResult] = await connection.query(
          `INSERT INTO users
           (first_name, last_name, phone, role, billing_street, billing_zip, billing_city, billing_country)
           VALUES (?, ?, ?, 'guest', ?, ?, ?, ?)`,
          [first_name, last_name, phone || null, billing_street, billing_zip, billing_city, billing_country]
        );
        userId = userResult.insertId;
      }
      
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
        
        // Update stock
        const previousQuantity = product.stock_quantity;
        const newQuantity = previousQuantity - item.quantity;
        
        await connection.query(
          "UPDATE products SET stock_quantity = ? WHERE id = ?",
          [newQuantity, item.product_id]
        );

        // Store stock change for history recording after invoice creation
        stockChanges.push({
          product_id: item.product_id,
          user_id: userId,
          quantity_change: -item.quantity,
          previous_quantity: previousQuantity,
          new_quantity: newQuantity,
        });
      }
      
      // Create invoice (now references user_id instead of customer_id)
      const [invoiceResult] = await connection.query(
        "INSERT INTO invoices (user_id, total_amount, status) VALUES (?, ?, 'pending')",
        [userId, total]
      );
      const invoiceId = invoiceResult.insertId;

      // Record stock history with invoice reference
      for (const stockChange of stockChanges) {
        await connection.query(
          `INSERT INTO stock_history 
           (product_id, user_id, change_type, quantity_change, previous_quantity, new_quantity, reason, reference_type, reference_id)
           VALUES (?, ?, 'sale', ?, ?, ?, 'Checkout sale', 'invoice', ?)`,
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
      const [invoiceRows] = await pool.query(
        "SELECT * FROM invoices WHERE id = ?",
        [invoiceId]
      );
      
      logger.info(`Checkout processed: Invoice ${invoiceId} for user ${userId}`);
      
      return invoiceRows[0];
    } catch (error) {
      await connection.rollback();
      logger.error("Checkout error:", error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new CheckoutService();
