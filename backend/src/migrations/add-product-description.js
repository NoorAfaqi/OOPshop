const pool = require("../config/database");
const dotenv = require("dotenv");

dotenv.config();

async function addProductDescription() {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));

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

    try {
      const [columns] = await pool.query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'products'
        AND COLUMN_NAME = 'description'
      `);

      if (columns.length === 0) {
        await pool.query(`
          ALTER TABLE products
          ADD COLUMN description TEXT NULL AFTER category
        `);
        console.log("✅ Added description column to products table");
      } else {
        console.log("ℹ️  description column already exists");
      }
    } catch (err) {
      if (err.message.includes("Duplicate column name")) {
        console.log("ℹ️  description column already exists");
      } else {
        console.warn("⚠️  Warning: Could not add description column:", err.message);
      }
    }

    console.log("✅ Product description migration completed successfully.");
  } catch (err) {
    console.error("❌ Product description migration error:", err);
    throw err;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  addProductDescription()
    .then(() => {
      console.log("✅ Migration completed");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Migration failed:", err);
      process.exit(1);
    });
}

module.exports = addProductDescription;
