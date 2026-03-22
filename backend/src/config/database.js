const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const logger = require("./logger");

dotenv.config();

// Optimized database pool configuration for production
const config = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "oopshop",
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || (process.env.NODE_ENV === "production" ? 20 : 10),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 60000,
  // Enable connection pooling optimizations
  multipleStatements: false, // Security: prevent SQL injection via multiple statements
  dateStrings: false, // Use Date objects instead of strings
  supportBigNumbers: true,
  bigNumberStrings: false,
};

let pool;

try {
  pool = mysql.createPool(config);
  
  // Test connection
  pool.getConnection()
    .then(connection => {
      logger.info("Database connection established successfully");
      connection.release();
    })
    .catch(err => {
      logger.error("Database connection failed:", err);
    });
} catch (error) {
  logger.error("Failed to create database pool:", error);
}

module.exports = pool;

