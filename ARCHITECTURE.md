# OOPshop Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [Backend Architecture](#backend-architecture)
3. [Frontend Architecture](#frontend-architecture)
4. [Security](#security)
5. [API Documentation](#api-documentation)
6. [Database Schema](#database-schema)
7. [Deployment](#deployment)
8. [Best Practices](#best-practices)

---

## Overview

OOPshop is a modern, scalable e-commerce platform built with a clear separation of concerns, following industry best practices for security, maintainability, and scalability.

### Technology Stack

**Backend:**
- Node.js with Express.js
- MySQL database
- JWT authentication
- Swagger/OpenAPI for API documentation

**Frontend:**
- Next.js 16 (React 19)
- TypeScript
- Material-UI (MUI)
- Client-side state management

---

## Backend Architecture

### Folder Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.js   # Database connection pool
│   │   ├── logger.js     # Winston logger configuration
│   │   ├── security.js   # Security middleware (Helmet, CORS, Rate Limiting)
│   │   └── swagger.js    # Swagger/OpenAPI specification
│   │
│   ├── controllers/      # Request handlers
│   │   ├── auth.controller.js
│   │   ├── checkout.controller.js
│   │   └── product.controller.js
│   │
│   ├── services/         # Business logic layer
│   │   ├── auth.service.js
│   │   ├── checkout.service.js
│   │   └── product.service.js
│   │
│   ├── middleware/       # Custom middleware
│   │   ├── auth.js       # JWT authentication middleware
│   │   ├── errorHandler.js  # Global error handler
│   │   └── validation.js    # Request validation middleware
│   │
│   ├── validators/       # Input validation schemas
│   │   ├── auth.validator.js
│   │   ├── checkout.validator.js
│   │   └── product.validator.js
│   │
│   ├── routes/           # API routes
│   │   ├── auth.routes.js
│   │   ├── checkout.routes.js
│   │   ├── product.routes.js
│   │   ├── invoices.js
│   │   ├── payments.js
│   │   ├── reports.js
│   │   └── users.js
│   │
│   ├── utils/            # Utility functions
│   │   └── response.js   # Standardized API responses
│   │
│   ├── app.js            # Express app configuration
│   ├── server.js         # Server initialization
│   ├── index.js          # Entry point
│   ├── db.js             # Legacy database connection (to be migrated)
│   └── migrate.js        # Database migrations
│
├── logs/                 # Application logs (auto-generated)
├── package.json
└── .env                  # Environment variables
```

### Architectural Patterns

#### 1. **Layered Architecture**

The backend follows a layered architecture pattern:

- **Routes Layer**: Handles HTTP requests and routing
- **Controller Layer**: Processes requests, calls services, formats responses
- **Service Layer**: Contains business logic
- **Data Access Layer**: Database queries and operations

**Benefits:**
- Clear separation of concerns
- Easier testing and maintenance
- Reusable business logic
- Better error handling

#### 2. **Dependency Injection**

Services are instantiated as singletons and injected into controllers:

```javascript
// Service
class ProductService {
  async createProduct(data) { /* ... */ }
}
module.exports = new ProductService();

// Controller
const productService = require('../services/product.service');
const createProduct = async (req, res) => {
  const product = await productService.createProduct(req.body);
  // ...
};
```

#### 3. **Error Handling Strategy**

Centralized error handling with custom error classes:

```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}
```

All async route handlers are wrapped with `asyncHandler` to catch errors automatically.

### Key Features

#### Security Middleware

1. **Helmet.js**: Secures HTTP headers
2. **CORS**: Configured for specific origins
3. **Rate Limiting**: 
   - General API: 100 requests per 15 minutes
   - Auth endpoints: 5 requests per 15 minutes
4. **Input Validation**: Express-validator for all inputs
5. **JWT Authentication**: Secure token-based auth

#### Logging

Winston logger with:
- Console logging (development)
- File logging (production)
- Error log file
- Combined log file
- Structured JSON logs

#### Database Connection Pooling

- Connection pool with 10 connections
- Automatic reconnection
- Keep-alive enabled
- Transaction support for complex operations

---

## Frontend Architecture

### Folder Structure

```
frontend/
├── app/                  # Next.js 13+ App Router
│   ├── cart/
│   ├── checkout/
│   ├── dashboard/
│   ├── login/
│   ├── shop/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── theme.ts
│   └── ThemeRegistry.tsx
│
├── components/           # Reusable React components
│   └── shared/
│       └── ErrorBoundary.tsx
│
├── lib/                  # Core library code
│   ├── config/          # Configuration
│   │   └── api.config.ts
│   │
│   ├── services/        # API service layer
│   │   ├── api.service.ts      # Base API client
│   │   ├── auth.service.ts     # Authentication
│   │   ├── product.service.ts  # Product operations
│   │   └── checkout.service.ts # Checkout operations
│   │
│   ├── hooks/           # Custom React hooks
│   │   ├── useAuth.ts   # Authentication hook
│   │   └── useCart.ts   # Shopping cart hook
│   │
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   │
│   └── utils/           # Utility functions
│       ├── formatters.ts
│       └── validators.ts
│
├── public/              # Static assets
├── .env.local           # Environment variables
├── next.config.ts
├── package.json
└── tsconfig.json
```

### Architectural Patterns

#### 1. **Service Layer Pattern**

All API calls are abstracted into service classes:

```typescript
class ProductService {
  async getAllProducts(filters?: ProductFilters) {
    return apiService.get<Product[]>(API_ENDPOINTS.PRODUCTS, false, filters);
  }
}
```

**Benefits:**
- Centralized API logic
- Easy to mock for testing
- Type-safe with TypeScript
- Reusable across components

#### 2. **Custom Hooks Pattern**

Business logic is encapsulated in custom hooks:

```typescript
export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  // Cart logic...
  return { cart, addToCart, removeFromCart, /* ... */ };
}
```

**Benefits:**
- Reusable stateful logic
- Cleaner components
- Better testing
- Follows React best practices

#### 3. **Type-Safe API Calls**

All API responses are typed:

```typescript
interface ApiResponse<T> {
  status: "success" | "error";
  message?: string;
  data?: T;
}
```

### Key Features

#### Type Safety

Full TypeScript support with:
- Strict type checking
- Interface definitions for all entities
- Type-safe API calls
- IntelliSense support

#### Error Boundaries

React Error Boundaries catch runtime errors:
- Graceful error display
- Error logging
- Reset functionality
- Development mode details

#### Client-Side Storage

- JWT token storage
- Shopping cart persistence
- User preferences
- localStorage abstraction

---

## Security

### Backend Security Measures

1. **Authentication & Authorization**
   - JWT tokens with configurable expiration
   - Bearer token authentication
   - Protected routes middleware
   - Secure password hashing (bcrypt)

2. **Input Validation**
   - Express-validator on all endpoints
   - Schema validation
   - SQL injection prevention
   - XSS protection

3. **Rate Limiting**
   - IP-based rate limiting
   - Different limits for different endpoints
   - DDoS prevention

4. **HTTP Security Headers**
   - Helmet.js configuration
   - Content Security Policy
   - HSTS enabled
   - XSS protection

5. **CORS Policy**
   - Specific origin whitelist
   - Credentials support
   - Preflight handling

6. **Database Security**
   - Prepared statements (parameterized queries)
   - Connection pooling
   - Transaction support
   - Foreign key constraints

### Frontend Security Measures

1. **Secure Token Storage**
   - localStorage for tokens
   - Automatic token inclusion in requests
   - Token cleanup on logout

2. **Input Validation**
   - Client-side validation utilities
   - Type checking with TypeScript
   - Form validation

3. **HTTPS Only** (Production)
   - Secure cookie flags
   - HSTS headers

---

## API Documentation

### Swagger/OpenAPI Integration

Access the interactive API documentation at:
```
http://localhost:3001/api-docs
```

Features:
- Interactive API testing
- Complete endpoint documentation
- Request/response schemas
- Authentication testing
- Example payloads

### Key Endpoints

#### Public Endpoints

```
GET  /health                 - Health check
GET  /products               - List products (with filters)
GET  /products/:id           - Get product details
POST /checkout               - Process checkout
POST /auth/login             - Manager login
```

#### Protected Endpoints (Require JWT)

```
POST   /products             - Create product
PUT    /products/:id         - Update product
DELETE /products/:id         - Delete product
POST   /products/from-barcode - Fetch from Open Food Facts

GET    /invoices             - List invoices
GET    /invoices/:id         - Get invoice details
POST   /invoices             - Create invoice
PUT    /invoices/:id         - Update invoice
DELETE /invoices/:id         - Delete invoice

GET    /users                - List users
GET    /reports              - Get reports
GET    /payments             - List payments
```

### Response Format

All API responses follow a standard format:

```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

Error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "msg": "Validation error message",
      "param": "field_name",
      "location": "body"
    }
  ]
}
```

---

## Database Schema

### Tables

#### managers
```sql
- id (INT, PK, AUTO_INCREMENT)
- email (VARCHAR(255), UNIQUE, NOT NULL)
- password_hash (VARCHAR(255), NOT NULL)
- first_name (VARCHAR(100))
- last_name (VARCHAR(100))
- created_at (TIMESTAMP)
```

#### customers
```sql
- id (INT, PK, AUTO_INCREMENT)
- first_name (VARCHAR(100), NOT NULL)
- last_name (VARCHAR(100), NOT NULL)
- phone (VARCHAR(50))
- billing_street (VARCHAR(255))
- billing_zip (VARCHAR(20))
- billing_city (VARCHAR(100))
- billing_country (VARCHAR(100))
- created_at (TIMESTAMP)
```

#### products
```sql
- id (INT, PK, AUTO_INCREMENT)
- name (VARCHAR(255), NOT NULL)
- price (DECIMAL(10,2), NOT NULL)
- brand (VARCHAR(255))
- image_url (VARCHAR(500))
- category (VARCHAR(255))
- nutritional_info (JSON)
- stock_quantity (INT, DEFAULT 0)
- open_food_facts_barcode (VARCHAR(50))
- created_at (TIMESTAMP)
```

#### invoices
```sql
- id (INT, PK, AUTO_INCREMENT)
- customer_id (INT, FK -> customers.id)
- total_amount (DECIMAL(10,2), NOT NULL)
- status (ENUM: 'pending', 'paid', 'cancelled')
- created_at (TIMESTAMP)
```

#### invoice_items
```sql
- id (INT, PK, AUTO_INCREMENT)
- invoice_id (INT, FK -> invoices.id, CASCADE)
- product_id (INT, FK -> products.id)
- quantity (INT, NOT NULL)
- unit_price (DECIMAL(10,2), NOT NULL)
```

#### payments
```sql
- id (INT, PK, AUTO_INCREMENT)
- invoice_id (INT, FK -> invoices.id, CASCADE)
- customer_id (INT, FK -> customers.id)
- amount (DECIMAL(10,2), NOT NULL)
- method (ENUM: 'paypal', 'card', 'cash', 'other')
- status (ENUM: 'pending', 'completed', 'failed')
- paypal_transaction_id (VARCHAR(255))
- created_at (TIMESTAMP)
```

### Relationships

- customers → invoices (1:N)
- invoices → invoice_items (1:N)
- products → invoice_items (1:N)
- invoices → payments (1:N)
- customers → payments (1:N)

---

## Deployment

### Backend Deployment

#### Prerequisites
```bash
Node.js >= 18.x
MySQL >= 8.0
npm or yarn
```

#### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run database migrations:
```bash
npm run migrate
```

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

#### Environment Variables

```env
# Server
PORT=3001
NODE_ENV=production

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=oopshop
DB_CONNECTION_LIMIT=10

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d

# CORS
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Deployment

#### Prerequisites
```bash
Node.js >= 18.x
npm or yarn
```

#### Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Configure environment:
```bash
# Create .env.local
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

3. Build and start:
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### Production Considerations

1. **Backend:**
   - Use process manager (PM2, systemd)
   - Enable logging to files
   - Set up log rotation
   - Use HTTPS
   - Configure firewall
   - Regular database backups

2. **Frontend:**
   - Use CDN for static assets
   - Enable caching
   - Optimize images
   - Use HTTPS
   - Configure proper headers

---

## Best Practices

### Code Organization

1. **Separation of Concerns**: Each layer has a single responsibility
2. **DRY Principle**: Reusable services and utilities
3. **Consistent Naming**: Clear, descriptive names for all entities
4. **Type Safety**: Full TypeScript on frontend, JSDoc on backend

### Error Handling

1. **Graceful Degradation**: Never expose internal errors to clients
2. **Logging**: All errors are logged with context
3. **User-Friendly Messages**: Clear error messages for users
4. **Validation**: Validate all inputs before processing

### Performance

1. **Database Indexing**: Index frequently queried fields
2. **Connection Pooling**: Efficient database connections
3. **Caching**: Client-side caching with React hooks
4. **Lazy Loading**: Code splitting in Next.js

### Security

1. **Input Validation**: Always validate and sanitize inputs
2. **Parameterized Queries**: Prevent SQL injection
3. **Rate Limiting**: Protect against abuse
4. **HTTPS Only**: Encrypt all communications
5. **Secure Headers**: Use Helmet.js
6. **JWT Expiration**: Set reasonable token expiration

### Testing Strategy

1. **Unit Tests**: Test individual functions and services
2. **Integration Tests**: Test API endpoints
3. **End-to-End Tests**: Test complete user flows
4. **Security Tests**: Penetration testing

### Documentation

1. **Swagger/OpenAPI**: Always keep API docs updated
2. **Code Comments**: Explain complex logic
3. **README Files**: Setup and usage instructions
4. **Architecture Docs**: This document!

---

## Scalability Considerations

### Horizontal Scaling

- Stateless API design enables multiple instances
- Load balancer can distribute traffic
- Database connection pooling per instance

### Vertical Scaling

- Increase database connection pool size
- Optimize queries with proper indexing
- Add Redis for caching (future enhancement)

### Microservices (Future)

Current monolithic architecture can be split into:
- Auth service
- Product service
- Order service
- Payment service

---

## Monitoring & Observability

### Logging

- Winston for structured logging
- Separate error and combined logs
- Log levels: error, warn, info, debug
- Request logging with Morgan

### Health Checks

```bash
GET /health
Response: { "status": "ok", "timestamp": "..." }
```

### Metrics (Future Enhancement)

- Request duration
- Error rates
- Database query performance
- API endpoint usage

---

## Future Enhancements

1. **Caching Layer**: Redis for session and data caching
2. **Message Queue**: Bull/RabbitMQ for async processing
3. **Email Service**: Transactional emails
4. **Payment Integration**: Stripe/PayPal SDK
5. **Real-time Updates**: WebSockets for live data
6. **Search Engine**: Elasticsearch for advanced search
7. **File Upload**: S3/CloudFlare for images
8. **Analytics**: User behavior tracking
9. **A/B Testing**: Feature flags
10. **Mobile App**: React Native app

---

## Support & Maintenance

### Regular Maintenance Tasks

1. **Update Dependencies**: Monthly security updates
2. **Database Backup**: Daily automated backups
3. **Log Rotation**: Weekly log cleanup
4. **Security Audit**: Quarterly reviews
5. **Performance Testing**: Monthly load tests

### Contact

For questions or support, contact:
- Email: support@oopshop.com
- Documentation: /api-docs
- GitHub: (repository link)

---

**Version**: 1.0.0
**Last Updated**: December 2025
**Maintained by**: Muhammad Noor Afaqi

