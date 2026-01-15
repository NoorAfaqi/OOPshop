const logger = require("../config/logger");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Generate request ID for tracking (if not already set)
  const requestId = req.id || req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Enhanced error logging for production debugging
  const errorLog = {
    requestId,
    message: err.message,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString(),
  };

  // Only log stack trace in development or for 5xx errors
  if (process.env.NODE_ENV === "development" || err.statusCode >= 500) {
    errorLog.stack = err.stack;
  }

  // Log additional context for database errors
  if (err.code && (err.code.startsWith('ER_') || err.code.startsWith('ECONN'))) {
    errorLog.databaseError = true;
    errorLog.errorCode = err.code;
  }

  logger.error("Error occurred:", errorLog);

  // Development error response
  if (process.env.NODE_ENV === "development") {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      stack: err.stack,
      requestId,
      error: err,
    });
  }

  // Production error response
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      requestId, // Include request ID for support tracking
    });
  }

  // Programming or unknown errors: don't leak details
  return res.status(500).json({
    status: "error",
    message: "Something went wrong",
    requestId, // Include request ID for support tracking
  });
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  errorHandler,
  asyncHandler,
};

