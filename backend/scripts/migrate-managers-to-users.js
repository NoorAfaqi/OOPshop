/**
 * Migration Script: Move managers to unified users table
 * This script migrates existing manager accounts to the new users table
 */

const pool = require("../src/config/database");

async function migrateManagersToUsers() {
  console.log("🔄 Starting migration: managers → users...\n");

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Check if managers table exists
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'managers'"
    );

    if (tables.length === 0) {
      console.log("ℹ️  No managers table found. Migration not needed.");
      await connection.commit();
      return;
    }

    // Get all managers
    const [managers] = await connection.query(
      "SELECT * FROM managers"
    );

    if (managers.length === 0) {
      console.log("ℹ️  No managers to migrate.");
    } else {
      console.log(`📊 Found ${managers.length} manager(s) to migrate:\n`);

      // Migrate each manager to users table
      for (const manager of managers) {
        // Check if user already exists
        const [existing] = await connection.query(
          "SELECT id FROM users WHERE email = ?",
          [manager.email]
        );

        if (existing.length > 0) {
          console.log(`⚠️  User already exists: ${manager.email} (skipped)`);
          continue;
        }

        // Insert into users table with manager role
        await connection.query(
          `INSERT INTO users (email, password_hash, first_name, last_name, role, created_at)
           VALUES (?, ?, ?, ?, 'manager', ?)`,
          [
            manager.email,
            manager.password_hash,
            manager.first_name,
            manager.last_name,
            manager.created_at
          ]
        );

        console.log(`✅ Migrated: ${manager.email} → users table (role: manager)`);
      }
    }

    // Rename old managers table for backup
    await connection.query(
      "RENAME TABLE managers TO managers_backup"
    );

    console.log("\n📦 Old managers table renamed to 'managers_backup'");
    console.log("💡 You can drop it later with: DROP TABLE managers_backup;\n");

    await connection.commit();

    console.log("✅ Migration completed successfully!\n");
    console.log("📝 Summary:");
    console.log(`   - Migrated ${managers.length} manager(s) to users table`);
    console.log("   - Old table backed up as 'managers_backup'");
    console.log("   - All managers now have role: 'manager'\n");

  } catch (error) {
    await connection.rollback();
    console.error("\n❌ Migration failed:", error);
    console.error("\n🔄 Transaction rolled back. No changes made.\n");
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
}

// Run migration
migrateManagersToUsers();
