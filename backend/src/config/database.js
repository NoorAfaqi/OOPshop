const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const logger = require("./logger");

dotenv.config();

const config = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "oopshop",
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
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

