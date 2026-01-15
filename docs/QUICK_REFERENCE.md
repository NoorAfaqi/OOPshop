# 🚀 OOPshop Quick Reference

Quick commands and URLs for daily development.

## 🏃 Quick Start

```bash
# Backend
cd backend
npm install
npm run migrate
npm run create-admin
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## 🔗 Important URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Main application |
| Backend API | http://localhost:3001 | REST API |
| API Docs | http://localhost:3001/api-docs | Swagger UI |
| Health Check | http://localhost:3001/health | Server health |

## 📝 Common Commands

### Backend Commands

```bash
# Development
npm run dev                    # Start dev server
npm start                      # Start production server
npm run migrate                # Run database migrations
npm run create-admin           # Create admin user
npm run generate-password      # Generate password hash

# Testing
curl http://localhost:3001/health
curl http://localhost:3001/products
```

### Frontend Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm start                      # Start production server
npm run lint                   # Run ESLint
```

### Database Commands

```bash
# Connect to MySQL
mysql -u root -p oopshop

# Backup database
mysqldump -u root -p oopshop > backup.sql

# Restore database
mysql -u root -p oopshop < backup.sql

# Show tables
mysql -u root -p oopshop -e "SHOW TABLES;"
```

## 🔐 Authentication

### Login via API

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@oopshop.com",
    "password": "your_password"
  }'
```

### Using JWT Token

```bash
TOKEN="your_jwt_token_here"

curl -X GET http://localhost:3001/invoices \
  -H "Authorization: Bearer $TOKEN"
```

## 📦 API Endpoints Cheat Sheet

### Public Endpoints

```bash
# Health check
GET /health

# List products
GET /products
GET /products?q=search&category=fruits&available=true

# Get product
GET /products/:id

# Checkout
POST /checkout
Content-Type: application/json
{
  "first_name": "John",
  "last_name": "Doe",
  "billing_street": "123 Main St",
  "billing_zip": "12345",
  "billing_city": "New York",
  "billing_country": "USA",
  "items": [
    { "product_id": 1, "quantity": 2 }
  ]
}

# Login
POST /auth/login
Content-Type: application/json
{
  "email": "admin@oopshop.com",
  "password": "password123"
}
```

### Protected Endpoints (Require JWT)

```bash
# Create product
POST /products
Authorization: Bearer {token}
Content-Type: application/json
{
  "name": "Product Name",
  "price": 9.99,
  "stock_quantity": 100
}

# Update product
PUT /products/:id
Authorization: Bearer {token}

# Delete product
DELETE /products/:id
Authorization: Bearer {token}

# List invoices
GET /invoices
Authorization: Bearer {token}

# Get invoice details
GET /invoices/:id
Authorization: Bearer {token}
```

## 🗄️ Database Schema Quick View

```sql
-- Tables
managers (id, email, password_hash, first_name, last_name)
customers (id, first_name, last_name, phone, billing_*)
products (id, name, price, brand, category, stock_quantity)
invoices (id, customer_id, total_amount, status)
invoice_items (id, invoice_id, product_id, quantity, unit_price)
payments (id, invoice_id, customer_id, amount, method, status)

-- Useful queries
SELECT * FROM managers;
SELECT * FROM products ORDER BY created_at DESC LIMIT 10;
SELECT * FROM invoices WHERE status = 'pending';
SELECT COUNT(*) FROM products WHERE stock_quantity > 0;
```

## 📁 File Structure Quick Reference

```
backend/src/
├── config/           # database.js, logger.js, security.js, swagger.js
├── controllers/      # auth, product, checkout controllers
├── services/         # Business logic layer
├── middleware/       # auth, errorHandler, validation
├── validators/       # Input validation schemas
├── routes/           # API route definitions
└── utils/           # Helper functions

frontend/lib/
├── config/          # api.config.ts
├── services/        # api, auth, product, checkout services
├── hooks/           # useAuth, useCart
├── types/           # TypeScript interfaces
└── utils/           # formatters, validators
```

## 🔧 Environment Variables

### Backend (.env)

```env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=oopshop
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🐛 Common Issues

### Port in use

```bash
# Find process
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Database connection error

```bash
# Check MySQL is running
mysql -u root -p

# Check credentials in .env
cat backend/.env
```

### CORS error

- Check `CORS_ORIGIN` in backend `.env`
- Ensure frontend URL matches exactly
- Restart backend server

### JWT token invalid

- Check `JWT_SECRET` in `.env`
- Login again to get new token
- Check token hasn't expired

## 📊 Monitoring

### Check Logs

```bash
# View combined logs
tail -f backend/logs/combined.log

# View error logs only
tail -f backend/logs/error.log

# Filter logs
grep "ERROR" backend/logs/combined.log
```

### Check Health

```bash
# API health
curl http://localhost:3001/health

# Database check
mysql -u root -p -e "SELECT 1;"
```

## 🚀 Production Deployment

### Quick Deploy (Backend)

```bash
# Update code
git pull

# Install dependencies
npm install

# Run migrations
npm run migrate

# Restart with PM2
pm2 restart oopshop-api
```

### Quick Deploy (Frontend)

```bash
# Update code
git pull

# Install dependencies
npm install

# Build
npm run build

# Restart
pm2 restart oopshop-frontend
```

## 📚 Documentation Links

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Project overview |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Detailed setup instructions |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture |
| [CHECKLIST.md](CHECKLIST.md) | Setup and deployment checklist |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | What was built |

## 💡 Tips & Tricks

### Development

```bash
# Watch mode for backend (install nodemon)
npm install -g nodemon
nodemon src/index.js

# Clear Next.js cache
rm -rf .next

# Reset database
mysql -u root -p -e "DROP DATABASE oopshop; CREATE DATABASE oopshop;"
npm run migrate
```

### Testing APIs

- Use Swagger UI: http://localhost:3001/api-docs
- Use Postman or Insomnia
- Use curl commands above

### Debugging

```bash
# Enable debug logs (add to .env)
LOG_LEVEL=debug

# Node.js debugging
node --inspect src/index.js
```

## 🔑 Security Reminders

- ⚠️ Never commit `.env` files
- ⚠️ Use strong passwords
- ⚠️ Change JWT_SECRET in production
- ⚠️ Enable HTTPS in production
- ⚠️ Keep dependencies updated
- ⚠️ Regular backups

## 📞 Need Help?

1. Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions
2. Check [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
3. Check logs: `backend/logs/`
4. Check API docs: http://localhost:3001/api-docs
5. Contact: support@oopshop.com

---

**Pro Tip**: Bookmark this page for quick reference during development! 🎯

