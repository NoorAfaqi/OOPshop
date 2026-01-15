const pool = require("./config/database");

async function runMigrations() {
  try {
    // Single unified users table for ALL user types and customer billing info
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255),
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(50),
        role ENUM('admin', 'manager', 'customer', 'guest') NOT NULL DEFAULT 'customer',
        is_active BOOLEAN DEFAULT TRUE,
        
        -- Customer/Billing Information (optional, filled during checkout)
        billing_street VARCHAR(255),
        billing_zip VARCHAR(20),
        billing_city VARCHAR(100),
        billing_country VARCHAR(100),
        
        -- Profile picture URL
        profile_picture_url VARCHAR(500),
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_email (email),
        INDEX idx_role (role)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        brand VARCHAR(255),
        image_url VARCHAR(500),
        category VARCHAR(255),
        nutritional_info JSON,
        stock_quantity INT NOT NULL DEFAULT 0,
        open_food_facts_barcode VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_brand (brand),
        INDEX idx_stock_quantity (stock_quantity),
        INDEX idx_barcode (open_food_facts_barcode),
        INDEX idx_name (name(100))
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending','paid','cancelled','shipped') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_invoices_user
          FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE RESTRICT,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        CONSTRAINT fk_items_invoice
          FOREIGN KEY (invoice_id) REFERENCES invoices(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_items_product
          FOREIGN KEY (product_id) REFERENCES products(id)
          ON DELETE RESTRICT,
        INDEX idx_invoice_id (invoice_id),
        INDEX idx_product_id (product_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_id INT NOT NULL,
        user_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        method ENUM('paypal','card','cash','other') DEFAULT 'paypal',
        status ENUM('pending','completed','failed') DEFAULT 'pending',
        paypal_transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_payments_invoice
          FOREIGN KEY (invoice_id) REFERENCES invoices(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_payments_user
          FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE RESTRICT,
        INDEX idx_invoice_id (invoice_id),
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `);

    // Add profile_picture_url column if it doesn't exist (for existing databases)
    try {
      const [columns] = await pool.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'profile_picture_url'
      `);
      
      if (columns.length === 0) {
        await pool.query(`
          ALTER TABLE users 
          ADD COLUMN profile_picture_url VARCHAR(500) AFTER billing_country
        `);
        console.log("✅ Added profile_picture_url column to users table");
      }
    } catch (err) {
      // Column might already exist or other error
      if (err.message.includes('Duplicate column name')) {
        console.log("ℹ️  profile_picture_url column already exists");
      } else {
        console.warn("⚠️  Warning: Could not add profile_picture_url column:", err.message);
      }
    }

    // Inventory Management: Add reorder_point column to products table
    try {
      const [reorderColumns] = await pool.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'products' 
        AND COLUMN_NAME = 'reorder_point'
      `);
      
      if (reorderColumns.length === 0) {
        await pool.query(`
          ALTER TABLE products 
          ADD COLUMN reorder_point INT DEFAULT 10 AFTER stock_quantity
        `);
        console.log("✅ Added reorder_point column to products table");
      }
    } catch (err) {
      if (err.message.includes('Duplicate column name')) {
        console.log("ℹ️  reorder_point column already exists");
      } else {
        console.warn("⚠️  Warning: Could not add reorder_point column:", err.message);
      }
    }

    // Inventory Management: Create stock_history table for audit trail
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stock_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        user_id INT,
        change_type ENUM('sale', 'purchase', 'adjustment', 'return', 'damage', 'other') NOT NULL,
        quantity_change INT NOT NULL,
        previous_quantity INT NOT NULL,
        new_quantity INT NOT NULL,
        reason VARCHAR(500),
        reference_type VARCHAR(50),
        reference_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_stock_history_product
          FOREIGN KEY (product_id) REFERENCES products(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_stock_history_user
          FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE SET NULL,
        INDEX idx_product_id (product_id),
        INDEX idx_created_at (created_at),
        INDEX idx_change_type (change_type)
      )
    `);
    console.log("✅ Created stock_history table for inventory management");

    console.log("✅ Migrations completed successfully.");
    console.log("📝 Single users table now handles all user types and customer billing info.");
    console.log("📦 Inventory management system (stock history & reorder points) is ready.");
  } catch (err) {
    console.error("❌ Migration error:", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runMigrations();
