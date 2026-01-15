const pool = require("../config/database");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../config/logger");
const emailService = require("./email.service");

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
      
      // Batch fetch all products at once to avoid N+1 queries
      const productIds = items.map(item => item.product_id);
      const placeholders = productIds.map(() => '?').join(',');
      const [productRows] = await connection.query(
        `SELECT id, price, stock_quantity FROM products WHERE id IN (${placeholders}) FOR UPDATE`,
        productIds
      );

      // Create a map for O(1) lookup
      const productMap = new Map(productRows.map(p => [p.id, p]));

      // Calculate total and validate stock (but don't reduce it yet - will be reduced when shipped)
      let total = 0;
      for (const item of items) {
        const product = productMap.get(item.product_id);
        
        if (!product) {
          throw new AppError(`Product with ID ${item.product_id} not found`, 404);
        }
        
        // Validate stock availability but don't reduce it yet
        if (product.stock_quantity < item.quantity) {
          throw new AppError(`Insufficient stock for product ID ${item.product_id}. Available: ${product.stock_quantity}, Required: ${item.quantity}`, 400);
        }
        
        total += Number(product.price) * item.quantity;
      }
      
      // Create invoice (now references user_id instead of customer_id)
      // Stock will be reduced when order status changes to "shipped"
      const [invoiceResult] = await connection.query(
        "INSERT INTO invoices (user_id, total_amount, status) VALUES (?, ?, 'pending')",
        [userId, total]
      );
      const invoiceId = invoiceResult.insertId;
      
      // Batch insert invoice items
      const invoiceItemValues = items.map(item => {
        const product = productMap.get(item.product_id);
        return [invoiceId, item.product_id, item.quantity, product.price];
      });
      
      if (invoiceItemValues.length > 0) {
        const itemPlaceholders = invoiceItemValues.map(() => '(?, ?, ?, ?)').join(',');
        const flatValues = invoiceItemValues.flat();
        await connection.query(
          `INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price) VALUES ${itemPlaceholders}`,
          flatValues
        );
      }
      
      await connection.commit();
      
      // Fetch the created invoice
      const [invoiceRows] = await pool.query(
        "SELECT * FROM invoices WHERE id = ?",
        [invoiceId]
      );
      
      const invoice = invoiceRows[0];
      
      logger.info(`Checkout processed: Invoice ${invoiceId} for user ${userId}`);
      
      // Send order confirmation email (non-blocking)
      // Fetch user and items for email after transaction commits
      const [userRows] = await pool.query(
        "SELECT id, email, first_name, last_name FROM users WHERE id = ?",
        [userId]
      );
      const user = userRows[0];
      
      if (user && user.email) {
        const [itemsRows] = await pool.query(
          `SELECT ii.*, p.name
           FROM invoice_items ii
           JOIN products p ON p.id = ii.product_id
           WHERE ii.invoice_id = ?`,
          [invoiceId]
        );
        
        emailService.sendOrderPlacedEmail(invoice, user, itemsRows).catch((err) => {
          logger.error('Failed to send order placed email', { invoiceId, error: err.message });
        });
      }
      
      return invoice;
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
