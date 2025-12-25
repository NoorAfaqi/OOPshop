const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const logger = require("./config/logger");
const { 
  helmetConfig, 
  generalLimiter, 
  corsOptions 
} = require("./config/security");
const { errorHandler } = require("./middleware/errorHandler");

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const checkoutRoutes = require("./routes/checkout.routes");
const userRoutes = require("./routes/users");
const invoiceRoutes = require("./routes/invoices");
const reportsRoutes = require("./routes/reports");
const paymentsRoutes = require("./routes/payments");
const accountRoutes = require("./routes/account.routes");
const authMiddleware = require("./middleware/auth");

const app = express();

// Log all incoming requests - temporarily disabled to debug
// app.use((req, res, next) => {
//   logger.info(`${req.method} ${req.url}`);
//   next();
// });

// CORS must be first - before any other middleware
app.use(require("cors")({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Security middleware
// Temporarily disabled to debug connection reset issue
// app.use(helmetConfig);
// app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware - temporarily disabled to debug
// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
// } else {
//   app.use(morgan("combined", {
//     stream: {
//       write: (message) => logger.info(message.trim())
//     }
//   }));
// }

// API Documentation with Swagger - temporarily disabled to debug
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
//   explorer: true,
//   customCss: '.swagger-ui .topbar { display: none }',
//   customSiteTitle: "OOPshop API Documentation",
// }));

// Health check endpoint
/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     description: Check if the API is running
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// API version endpoint
app.get("/", (req, res) => {
  res.json({
    name: "OOPshop API",
    version: "1.0.0",
    documentation: "/api-docs",
    health: "/health",
  });
});

// Public routes
app.use("/auth", authRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/products", productRoutes);

// Protected routes (require authentication)
app.use("/users", authMiddleware(), userRoutes);
app.use("/invoices", authMiddleware(), invoiceRoutes);
app.use("/reports", authMiddleware(), reportsRoutes);
app.use("/payments", authMiddleware(), paymentsRoutes);
app.use("/account", authMiddleware(), accountRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
    path: req.path,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;

