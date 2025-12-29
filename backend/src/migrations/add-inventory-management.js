const pool = require("../config/database");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

async function addInventoryManagement() {
  try {
    // Wait a bit for database connection to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test connection first
    try {
      await pool.query("SELECT 1");
      console.log("✅ Database connection established");
    } catch (connErr) {
      console.error("❌ Database connection failed. Please ensure:");
      console.error("   1. MySQL/MariaDB is running");
      console.error("   2. Database credentials in .env are correct");
      console.error("   3. Database 'oopshop' exists");
      throw new Error("Database connection failed");
    }

    // Add reorder_point column to products table
    try {
      const [columns] = await pool.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'products' 
        AND COLUMN_NAME = 'reorder_point'
      `);
      
      if (columns.length === 0) {
        await pool.query(`
          ALTER TABLE products 
          ADD COLUMN reorder_point INT DEFAULT 10 AFTER stock_quantity
        `);
        console.log("✅ Added reorder_point column to products table");
      } else {
        console.log("ℹ️  reorder_point column already exists");
      }
    } catch (err) {
      if (err.message.includes('Duplicate column name')) {
        console.log("ℹ️  reorder_point column already exists");
      } else {
        console.warn("⚠️  Warning: Could not add reorder_point column:", err.message);
      }
    }

    // Create stock_history table for audit trail
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
    console.log("✅ Created stock_history table");

    console.log("✅ Inventory management migrations completed successfully.");
  } catch (err) {
    console.error("❌ Inventory management migration error:", err);
    throw err;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  addInventoryManagement()
    .then(() => {
      console.log("✅ Migration completed");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Migration failed:", err);
      process.exit(1);
    });
}

module.exports = addInventoryManagement;


