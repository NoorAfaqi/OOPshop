/**
 * Create admin user script
 * This script creates an admin user in the unified users table
 */

const bcrypt = require("bcrypt");
const pool = require("../src/config/database");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function createAdmin() {
  console.log("\n🔐 Create Admin User\n");

  try {
    const email = await question("Email: ");
    const password = await question("Password: ");
    const first_name = await question("First Name: ");
    const last_name = await question("Last Name: ");

    if (!email || !password || !first_name || !last_name) {
      console.error("\n❌ All fields are required!\n");
      rl.close();
      process.exit(1);
    }

    // Check if user already exists
    const [existing] = await pool.query(
      "SELECT id, email FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      console.error(`\n❌ User with email ${email} already exists!\n`);
      rl.close();
      await pool.end();
      process.exit(1);
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create admin user
    await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES (?, ?, ?, ?, 'admin')`,
      [email, password_hash, first_name, last_name]
    );

    console.log("\n✅ Admin user created successfully!");
    console.log("\n📝 User Details:");
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${first_name} ${last_name}`);
    console.log(`   Role: admin\n`);

  } catch (error) {
    console.error("\n❌ Error creating admin:", error.message);
    process.exitCode = 1;
  } finally {
    rl.close();
    await pool.end();
  }
}

createAdmin();
