const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

console.log("✅ Starting minimal app...");

// Simple CORS
app.use(cors({
  origin: "*",
  credentials: true
}));

console.log("✅ CORS configured");

app.use(express.json());

console.log("✅ JSON parser configured");

// Simple logging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

console.log("✅ Logger configured");

// Health endpoint
app.get("/health", (req, res) => {
  console.log("Health endpoint called");
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Products endpoint - simple version
app.get("/products", async (req, res) => {
  console.log("Products endpoint called");
  try {
    const pool = require("./config/database");
    const [rows] = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
    console.log(`Found ${rows.length} products`);
    res.json(rows);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error("💥 ERROR:", err);
  res.status(500).json({ error: err.message });
});

console.log("✅ App configured successfully");

module.exports = app;

