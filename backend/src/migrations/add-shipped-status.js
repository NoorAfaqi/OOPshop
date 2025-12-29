const pool = require("../config/database");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

async function addShippedStatus() {
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

    // Modify invoices table to add 'shipped' status to ENUM
    try {
      // Check current ENUM values
      const [columns] = await pool.query(`
        SELECT COLUMN_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'invoices' 
        AND COLUMN_NAME = 'status'
      `);
      
      if (columns.length > 0) {
        const currentEnum = columns[0].COLUMN_TYPE;
        console.log(`ℹ️  Current status ENUM: ${currentEnum}`);
        
        // Check if 'shipped' already exists
        if (!currentEnum.includes("shipped")) {
          // Modify the ENUM to include 'shipped'
          await pool.query(`
            ALTER TABLE invoices 
            MODIFY COLUMN status ENUM('pending','paid','cancelled','shipped') DEFAULT 'pending'
          `);
          console.log("✅ Added 'shipped' status to invoices table");
        } else {
          console.log("ℹ️  'shipped' status already exists in invoices table");
        }
      } else {
        console.warn("⚠️  Could not find status column in invoices table");
      }
    } catch (err) {
      console.error("❌ Error modifying invoices status ENUM:", err.message);
      throw err;
    }

    console.log("✅ Shipped status migration completed successfully.");
  } catch (err) {
    console.error("❌ Migration error:", err);
    throw err;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  addShippedStatus()
    .then(() => {
      console.log("✅ Migration completed");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Migration failed:", err);
      process.exit(1);
    });
}

module.exports = addShippedStatus;

