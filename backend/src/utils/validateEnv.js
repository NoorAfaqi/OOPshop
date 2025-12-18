const logger = require("../config/logger");

/**
 * Validate required environment variables
 */
function validateEnv() {
  const required = [
    "DB_HOST",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME",
    "JWT_SECRET",
  ];

  const missing = [];
  
  for (const varName of required) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    const errorMsg = `Missing required environment variables: ${missing.join(", ")}`;
    logger.error(errorMsg);
    console.error(`\n❌ ${errorMsg}`);
    console.error("\n💡 Please check your .env file and ensure all required variables are set.\n");
    process.exit(1);
  }

  // Validate JWT_SECRET length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    const errorMsg = "JWT_SECRET must be at least 32 characters long for security";
    logger.error(errorMsg);
    console.error(`\n❌ ${errorMsg}\n`);
    process.exit(1);
  }

  logger.info("Environment variables validated successfully");
}

module.exports = validateEnv;
