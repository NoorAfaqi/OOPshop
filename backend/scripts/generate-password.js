/**
 * Utility script to generate bcrypt password hashes
 * Usage: node scripts/generate-password.js [password]
 */

const bcrypt = require("bcrypt");

const password = process.argv[2];

if (!password) {
  console.error("Usage: node scripts/generate-password.js <password>");
  process.exit(1);
}

async function generateHash() {
  try {
    const hash = await bcrypt.hash(password, 10);
    console.log("\n✅ Password hash generated successfully!\n");
    console.log("Password:", password);
    console.log("Hash:", hash);
    console.log("\nYou can use this hash in your database:\n");
    console.log("INSERT INTO managers (email, password_hash, first_name, last_name)");
    console.log("VALUES ('admin@oopshop.com', '" + hash + "', 'Admin', 'User');\n");
  } catch (error) {
    console.error("Error generating hash:", error);
    process.exit(1);
  }
}

generateHash();

