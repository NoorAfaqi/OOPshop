const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

// Port is optional; if not provided, MySQL default (3306) is used.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;


