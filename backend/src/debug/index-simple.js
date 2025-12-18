const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  console.log("Health check called");
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/test", (req, res) => {
  console.log("Test endpoint called");
  res.json({ message: "Server is running", timestamp: new Date().toISOString() });
});

// Test database connection
const pool = require("./db");
app.get("/products", async (req, res) => {
  console.log("Products endpoint called");
  try {
    const [rows] = await pool.query("SELECT * FROM products LIMIT 10");
    console.log("Query successful, returning", rows.length, "products");
    res.json(rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error caught:", err);
  res.status(500).json({ message: "Error", error: err.message });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Simple test server listening on port ${PORT}`);
  console.log("Test with: curl http://localhost:4000/test");
});

