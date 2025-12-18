console.log("🔵 Loading app...");

// Load environment variables FIRST
require("dotenv").config();

// Validate environment variables
const validateEnv = require("./utils/validateEnv");
validateEnv();

const app = require("./app");
console.log("✅ App loaded successfully");

const logger = require("./config/logger");
const pool = require("./config/database");

const PORT = process.env.PORT || 5000;

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Promise Rejection:", err);
  logger.error("Unhandled Promise Rejection:", err);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

console.log(`🔵 Starting server on port ${PORT}...`);

const server = app.listen(PORT, () => {
  console.log(`✅ Server is now listening on port ${PORT}`);
  logger.info(`🚀 OOPshop API listening on port ${PORT}`);
  logger.info(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
  logger.info(`🏥 Health check available at http://localhost:${PORT}/health`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown - must be AFTER server is created
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  server.close(async () => {
    logger.info("Server closed");
    await pool.end();
    logger.info("Database connection closed");
    process.exit(0);
  });
});

server.on("error", (error) => {
  console.error("💥 Server error:", error);
  logger.error("Server error:", error);
});

server.on("connection", (socket) => {
  logger.info("New connection established");
  socket.on("error", (err) => {
    logger.error("Socket error:", err);
  });
});

module.exports = server;

