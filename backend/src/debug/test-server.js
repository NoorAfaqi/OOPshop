// Minimal test server to diagnose the issue
const express = require("express");
const cors = require("cors");

const app = express();

// CORS - simplest possible configuration
app.use(cors({
  origin: "*", // Allow all origins for testing
  credentials: true
}));

app.use(express.json());

// Test endpoint
app.get("/health", (req, res) => {
  console.log("Health endpoint hit!");
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Products endpoint
app.get("/products", (req, res) => {
  console.log("Products endpoint hit!");
  res.json([]);
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: err.message });
});

const PORT = 4001; // Different port to avoid conflict

app.listen(PORT, () => {
  console.log(`✅ Test server listening on port ${PORT}`);
  console.log(`Test: http://localhost:${PORT}/health`);
  console.log(`Test: http://localhost:${PORT}/products`);
});
