const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const compression = require("compression");
const timeout = require("connect-timeout");
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

// Add request ID middleware for tracking
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.id);
  next();
});

// CORS must be first - before any other middleware
// Supports both web browsers (CORS) and mobile apps (no CORS needed, but headers still sent)
app.use(corsOptions);

// Request timeout middleware - prevent hanging requests
app.use(timeout(process.env.REQUEST_TIMEOUT || '30000')); // 30 seconds default

// Compression middleware - compress responses for better performance
app.use(compression({
  level: 6, // Compression level (1-9, 6 is a good balance)
  filter: (req, res) => {
    // Don't compress if client doesn't support it or if response is already compressed
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// API Documentation with Swagger - register early to avoid conflicts
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "OOPshop API Documentation",
  })
);

// Security middleware
app.use(helmetConfig);
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

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
  // Add cache control headers for health check
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
    memory: process.memoryUsage()
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
// Payments routes - mixed auth (some public, some protected - handled in routes file)
app.use("/payments", paymentsRoutes);
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

