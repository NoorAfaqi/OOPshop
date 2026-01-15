const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

// Helmet configuration for security headers
const helmetConfig = helmet({
  contentSecurityPolicy: process.env.NODE_ENV === "production" ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  } : false, // Disable CSP in development (allows Swagger UI to work)
  hsts: process.env.NODE_ENV === "production" ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  } : false, // Disable HSTS in development
  crossOriginEmbedderPolicy: false, // Allow embedding in development
  crossOriginResourcePolicy: false, // Allow cross-origin resources
});

// Rate limiting configuration
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for health checks
    skip: (req) => req.path === '/health',
    // Use IP address for rate limiting
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress || 'unknown';
    },
  });
};

// General rate limiter
const generalLimiter = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
);

// Strict rate limiter for authentication endpoints
const authLimiter = createRateLimiter(15 * 60 * 1000, 5);

// CORS configuration - supports both web and mobile
const getCorsOrigin = () => {
  const corsOrigin = process.env.CORS_ORIGIN;
  const isProduction = process.env.NODE_ENV === "production";
  
  // In production, CORS_ORIGIN must be set
  if (isProduction && !corsOrigin) {
    throw new Error("CORS_ORIGIN must be set in production environment");
  }
  
  // If CORS_ORIGIN is not set, allow all origins in development (for mobile testing)
  if (!corsOrigin) {
    return true;
  }
  
  // In production, warn if CORS_ORIGIN is too permissive
  if (isProduction && corsOrigin === "*") {
    console.warn("⚠️  WARNING: CORS_ORIGIN is set to '*' in production. This is insecure!");
  }
  
  // If CORS_ORIGIN is "*", allow all origins
  if (corsOrigin === "*") {
    return true;
  }
  
  // Support multiple origins (comma-separated)
  if (corsOrigin.includes(",")) {
    return corsOrigin.split(",").map(origin => origin.trim());
  }
  
  // Single origin
  return corsOrigin;
};

const corsOptions = {
  origin: getCorsOrigin(),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200,
};

module.exports = {
  helmetConfig,
  generalLimiter,
  authLimiter,
  corsOptions: cors(corsOptions),
};

