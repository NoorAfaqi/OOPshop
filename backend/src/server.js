// Load environment variables FIRST
require("dotenv").config();

// Validate environment variables
const validateEnv = require("./utils/validateEnv");
validateEnv();

const app = require("./app");
const logger = require("./config/logger");
const pool = require("./config/database");

const PORT = process.env.PORT || 5000;

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Promise Rejection:", { error: err.message, stack: err.stack });
  // In production, we might want to exit, but for now just log
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", { error: err.message, stack: err.stack });
  process.exit(1);
});

const server = app.listen(PORT, () => {
  logger.info(`🚀 OOPshop API listening on port ${PORT}`);
  logger.info(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
  logger.info(`🏥 Health check available at http://localhost:${PORT}/health`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown - must be AFTER server is created
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  
  server.close(async () => {
    logger.info("HTTP server closed");
    
    try {
      await pool.end();
      logger.info("Database connection pool closed");
      process.exit(0);
    } catch (err) {
      logger.error("Error closing database pool:", err);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

server.on("error", (error) => {
  logger.error("Server error:", { error: error.message, stack: error.stack });
});

server.on("connection", (socket) => {
  logger.info("New connection established");
  socket.on("error", (err) => {
    logger.error("Socket error:", err);
  });
});

module.exports = server;

