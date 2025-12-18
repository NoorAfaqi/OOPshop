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

  logger.error("Error occurred:", {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
  });

  // Development error response
  if (process.env.NODE_ENV === "development") {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }

  // Production error response
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  // Programming or unknown errors: don't leak details
  return res.status(500).json({
    status: "error",
    message: "Something went wrong",
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

