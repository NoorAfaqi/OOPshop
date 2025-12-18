# 🛒 OOPshop - Modern E-Commerce Platform

A **scalable, secure, and production-ready** e-commerce platform built with modern web technologies and enterprise-grade architecture.

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.x-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

## ✨ Features

### 🎯 Core Functionality
- 🛍️ Product browsing and management
- 🛒 Shopping cart with persistence
- 💳 Checkout and order processing
- 📦 Invoice management
- 💰 Payment processing
- 📊 Dashboard and reporting
- 🔐 JWT authentication and authorization
- 🔒 Role-based access control
- 🔍 **OpenFoodFacts API Integration** - Import products by barcode with nutritional info

### 🏗️ Architecture
- **Backend**: Node.js + Express with layered architecture
- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Database**: MySQL with proper relationships
- **Security**: Helmet, Rate Limiting, Input Validation
- **Documentation**: Swagger/OpenAPI interactive docs
- **Logging**: Winston structured logging

### 🔒 Security Features
- ✅ JWT token-based authentication
- ✅ Bcrypt password hashing
- ✅ Rate limiting (DDoS protection)
- ✅ Input validation and sanitization
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CORS configuration
- ✅ Secure HTTP headers (Helmet)

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- MySQL >= 8.0
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd OOPshop
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run migrate
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
# Create .env.local with NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev
```

4. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api-docs

For detailed setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md)

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Complete setup and installation guide |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Comprehensive architecture documentation |
| [ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md) | Visual architecture diagrams |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Project overview and accomplishments |
| [backend/README.md](backend/README.md) | Backend-specific documentation |
| [frontend/README.md](frontend/README.md) | Frontend-specific documentation |

## 🏗️ Project Structure

```
OOPshop/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Custom middleware
│   │   ├── validators/     # Input validation
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   ├── app.js          # Express app
│   │   ├── server.js       # Server initialization
│   │   └── index.js        # Entry point
│   ├── logs/               # Application logs
│   └── package.json
│
├── frontend/               # Next.js React App
│   ├── app/               # Next.js pages
│   ├── components/        # React components
│   ├── lib/
│   │   ├── config/       # Configuration
│   │   ├── services/     # API services
│   │   ├── hooks/        # Custom React hooks
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utility functions
│   └── package.json
│
└── Documentation files
```

## 🔌 API Endpoints

### Public Endpoints
```
GET    /health                - Health check
GET    /products              - List products
GET    /products/:id          - Get product details
POST   /checkout              - Process checkout
POST   /auth/login            - Manager login
```

### Protected Endpoints (Require JWT)
```
POST   /products              - Create product
PUT    /products/:id          - Update product
DELETE /products/:id          - Delete product
GET    /invoices              - List invoices
GET    /invoices/:id          - Get invoice details
GET    /users                 - List users
GET    /reports               - Get reports
GET    /payments              - List payments
```

📖 **Full API Documentation**: http://localhost:3001/api-docs

## 🗄️ Database Schema

```
managers → (authentication)
customers → invoices → invoice_items → products
            ↓
         payments
```

Complete schema with relationships is detailed in [ARCHITECTURE.md](ARCHITECTURE.md)

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📈 Architecture Patterns

### Backend
- **Layered Architecture**: Routes → Controllers → Services → Database
- **Dependency Injection**: Services injected into controllers
- **Error Handling**: Centralized error middleware
- **Logging**: Structured logging with Winston
- **Security**: Multiple layers of security middleware

### Frontend
- **Service Layer Pattern**: API abstraction
- **Custom Hooks**: Reusable stateful logic
- **Type Safety**: Full TypeScript integration
- **Error Boundaries**: Graceful error handling

## 🔧 Technologies Used

### Backend
- **Framework**: Express.js
- **Database**: MySQL with mysql2
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Security**: Helmet, express-rate-limit, express-validator
- **Documentation**: Swagger (swagger-jsdoc, swagger-ui-express)
- **Logging**: Winston
- **Validation**: express-validator, Joi

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI)
- **Styling**: Emotion (CSS-in-JS)
- **State Management**: React hooks + localStorage

## 🌟 Key Features

### Scalability
- Horizontal scaling ready (stateless design)
- Database connection pooling
- Efficient resource management
- Microservices ready

### Security
- Multi-layer security approach
- JWT authentication
- Rate limiting
- Input validation
- SQL injection prevention

### Developer Experience
- Comprehensive documentation
- Interactive API docs (Swagger)
- Type safety (TypeScript)
- Structured error handling
- Detailed logging

### Production Ready
- Process management ready
- Environment-based configuration
- Graceful shutdown handling
- Health check endpoints
- Monitoring hooks

## 📊 Performance

- Connection pooling for database efficiency
- Optimized queries with proper indexing
- Client-side caching with React hooks
- Lazy loading with Next.js code splitting

## 🛡️ Security Best Practices

1. ✅ Never commit `.env` files
2. ✅ Use strong JWT secrets
3. ✅ Keep dependencies updated
4. ✅ Enable HTTPS in production
5. ✅ Regular security audits
6. ✅ Input validation on all endpoints
7. ✅ Rate limiting enabled
8. ✅ SQL injection prevention

## 🚀 Deployment

### Backend
```bash
cd backend
npm install
npm run migrate
npm start
```

Use PM2 for process management:
```bash
pm2 start src/index.js --name oopshop-api
```

### Frontend
```bash
cd frontend
npm install
npm run build
npm start
```

Or deploy to Vercel:
```bash
vercel
```

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed deployment instructions.

## 📝 Environment Variables

### Backend (.env)
```env
PORT=3001
NODE_ENV=production
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=oopshop
JWT_SECRET=your_secret_key
CORS_ORIGIN=https://yourdomain.com
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🤝 Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Ensure all security checks pass

## 📄 License

ISC License - see LICENSE file for details

## 👥 Author

**Muhammad Noor Afaqi**

## 🙏 Acknowledgments

- Express.js community
- Next.js team
- Material-UI developers
- Open source contributors

## 📞 Support

- 📧 Email: support@oopshop.com
- 📖 Documentation: See docs folder
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

## 🎯 Roadmap

- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Email notifications
- [ ] Real-time updates (WebSockets)
- [ ] Advanced search (Elasticsearch)
- [ ] Admin analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Redis caching layer
- [ ] Message queue integration
- [ ] Automated testing suite

---

**Built with ❤️ using modern web technologies for scalability, security, and maintainability.**

For detailed information, see [ARCHITECTURE.md](ARCHITECTURE.md) and [SETUP_GUIDE.md](SETUP_GUIDE.md)
