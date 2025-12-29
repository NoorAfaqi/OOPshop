# OOPshop Backend API

A scalable and secure e-commerce backend API built with Node.js, Express, and MySQL.

## Features

- ✅ RESTful API design
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Input validation with express-validator
- ✅ Comprehensive error handling
- ✅ Rate limiting and security headers
- ✅ Swagger/OpenAPI documentation
- ✅ Structured logging with Winston
- ✅ Database connection pooling
- ✅ Transaction support
- ✅ CORS configuration

## Quick Start

### Prerequisites

- Node.js >= 18.x
- MySQL >= 8.0
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
Create a `.env` file in the backend root:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=oopshop
DB_CONNECTION_LIMIT=10

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_change_this
JWT_EXPIRES_IN=1d

# CORS Configuration
# Supports both web and mobile:
# - Single origin: CORS_ORIGIN=http://localhost:3000
# - Multiple origins: CORS_ORIGIN=http://localhost:3000,https://yourapp.com
# - Allow all (development): CORS_ORIGIN=* (or leave empty in development)
# - Mobile apps don't need CORS but will work with any configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

3. **Run database migrations:**
```bash
npm run migrate
```

4. **Start the server:**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Documentation

Once the server is running, access the interactive API documentation:

```
http://localhost:3001/api-docs
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── middleware/      # Custom middleware
│   ├── validators/      # Input validation
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── app.js           # Express app
│   ├── server.js        # Server initialization
│   └── index.js         # Entry point
├── logs/                # Application logs
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm start` - Start production server
- `npm run migrate` - Run database migrations

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/auth/login` | Manager login |
| GET | `/products` | List products |
| GET | `/products/:id` | Get product details |
| POST | `/checkout` | Process checkout |

### Protected Endpoints (Require JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/products` | Create product |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |
| POST | `/products/from-barcode` | Fetch from Open Food Facts |
| GET | `/invoices` | List invoices |
| GET | `/invoices/:id` | Get invoice details |
| GET | `/users` | List users |
| GET | `/reports` | Get reports |
| GET | `/payments` | List payments |

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Login Example

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@oopshop.com",
    "password": "password123"
  }'
```

### Using the Token

```bash
curl -X GET http://localhost:3001/invoices \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Security Features

1. **Helmet.js** - Secure HTTP headers
2. **CORS** - Cross-Origin Resource Sharing
3. **Rate Limiting** - Prevent abuse
4. **Input Validation** - Validate all inputs
5. **JWT Authentication** - Secure token-based auth
6. **SQL Injection Prevention** - Parameterized queries
7. **Error Handling** - Centralized error handling

## Database Schema

See `src/migrate.js` for the complete database schema including:
- managers
- customers
- products
- invoices
- invoice_items
- payments

## Logging

Logs are stored in the `logs/` directory:
- `error.log` - Error logs only
- `combined.log` - All logs

## Error Handling

All errors follow a standard format:

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [/* validation errors */]
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| NODE_ENV | Environment | development |
| DB_HOST | Database host | localhost |
| DB_USER | Database user | root |
| DB_PASSWORD | Database password | - |
| DB_NAME | Database name | oopshop |
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRES_IN | Token expiration | 1d |
| CORS_ORIGIN | Allowed origin | http://localhost:3000 |

## Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Follow ESLint rules

## License

ISC

## Support

For issues or questions, please refer to the ARCHITECTURE.md file or contact support@oopshop.com

