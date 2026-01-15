# OOPshop Backend API

Node.js + Express backend API for the OOPshop e-commerce platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Run migrations
npm run migrate

# Start development server
npm run dev
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration (database, logger, security)
│   ├── controllers/      # Request handlers (MVC Controllers)
│   ├── services/         # Business logic (MVC Model)
│   ├── middleware/       # Custom middleware
│   ├── routes/           # API route definitions
│   ├── validators/       # Input validation schemas
│   ├── utils/            # Utility functions
│   └── migrations/       # Database migrations
├── __tests__/            # Test files
└── package.json
```

## 🧪 Testing

Backend uses **Mocha** and **Chai** for testing.

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

See [MOCHA_MIGRATION.md](./MOCHA_MIGRATION.md) for testing details.

## 📚 API Documentation

Interactive API documentation available at:
- Development: http://localhost:5000/api-docs
- Swagger UI with full endpoint specifications

## 🔒 Security Features

- JWT authentication
- Rate limiting
- Input validation
- SQL injection prevention
- CORS configuration
- Secure HTTP headers (Helmet)

## 📖 Documentation

- [Main README](../README.md) - Project overview
- [Architecture](../ARCHITECTURE.md) - Architecture documentation
- [Testing Guide](../docs/TESTING_GUIDE.md) - Testing documentation
- [Mocha Migration](./MOCHA_MIGRATION.md) - Mocha/Chai migration guide
