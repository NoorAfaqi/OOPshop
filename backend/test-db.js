const pool = require("./src/db");

async function testConnection() {
  try {
    const [rows] = await pool.query("SELECT 1 as test");
    console.log("Database connection successful:", rows);
    process.exit(0);
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
}

testConnection();

