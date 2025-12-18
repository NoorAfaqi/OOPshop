# Changelog

## [1.1.0] - 2025-12-18

### Added
- Environment variable validation on startup
- Comprehensive validators for all routes (customers, invoices, payments, reports)
- Service layer for customers, invoices, payments, and reports
- Controller layer for legacy routes
- Winston logger integration across all files
- Debug folder for test/development files

### Changed
- Refactored all legacy routes to MVC architecture pattern
- Consolidated database connections to single module
- Standardized error handling across all endpoints
- Improved response format consistency
- Re-enabled security middleware (Helmet, rate limiting)
- Moved SIGTERM handler after server initialization

### Removed
- Duplicate route files (auth.js, products.js)
- Legacy database connection module (db.js)
- Obsolete debug markdown files
- Root-level test files
- console.log/console.error usage (replaced with logger)

### Fixed
- Server variable reference before declaration
- Inconsistent database connection usage
- Mixed logging approaches
- Redundant try-catch in asyncHandler wrapped functions
- Missing input validation on legacy routes

### Security
- Re-enabled Helmet for XSS protection
- Re-enabled rate limiting (5 req/15min for auth, 100 req/15min general)
- Added comprehensive input validation to prevent SQL injection
- Environment variable validation ensures critical configs are present
- JWT_SECRET must be at least 32 characters

---

## [1.0.0] - Initial Release

### Added
- Express.js REST API
- MySQL database integration
- JWT authentication
- Product management (CRUD)
- Checkout system
- Invoice management
- Customer management
- Payment tracking
- Reports generation
- Open Food Facts API integration
- Swagger API documentation
- CORS support
- Morgan request logging
- bcrypt password hashing
