const logger = require("../config/logger");

/**
 * Validate required environment variables
 */
function validateEnv() {
  const isProduction = process.env.NODE_ENV === "production";
  
  const required = [
    "DB_HOST",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME",
    "JWT_SECRET",
  ];

  // Additional required variables for production
  const productionRequired = [
    "CORS_ORIGIN", // Must be set in production for security
  ];

  const allRequired = isProduction ? [...required, ...productionRequired] : required;
  const missing = [];
  
  for (const varName of allRequired) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    const errorMsg = `Missing required environment variables: ${missing.join(", ")}`;
    logger.error(errorMsg);
    if (!isProduction) {
      console.error(`\n❌ ${errorMsg}`);
      console.error("\n💡 Please check your .env file and ensure all required variables are set.\n");
    }
    process.exit(1);
  }

  // Validate JWT_SECRET length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    const errorMsg = "JWT_SECRET must be at least 32 characters long for security";
    logger.error(errorMsg);
    if (!isProduction) {
      console.error(`\n❌ ${errorMsg}\n`);
    }
    process.exit(1);
  }

  // Production-specific validations
  if (isProduction) {
    // Warn if CORS_ORIGIN is too permissive
    if (process.env.CORS_ORIGIN === "*") {
      logger.warn("CORS_ORIGIN is set to '*' - this allows all origins. Consider restricting for production.");
    }

    // Validate database connection limit is reasonable
    const dbLimit = parseInt(process.env.DB_CONNECTION_LIMIT) || 10;
    if (dbLimit < 5) {
      logger.warn(`DB_CONNECTION_LIMIT is very low (${dbLimit}). Consider increasing for production.`);
    }
    if (dbLimit > 100) {
      logger.warn(`DB_CONNECTION_LIMIT is very high (${dbLimit}). This may cause database connection issues.`);
    }
  }

  logger.info("Environment variables validated successfully", {
    environment: process.env.NODE_ENV || "development",
    hasDbConfig: !!process.env.DB_HOST,
    hasJwtSecret: !!process.env.JWT_SECRET,
  });
}

module.exports = validateEnv;
