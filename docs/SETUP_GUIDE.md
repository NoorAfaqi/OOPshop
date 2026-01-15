# OOPshop Setup Guide

Complete step-by-step guide to set up and run the OOPshop application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.x or higher)
- **MySQL** (version 8.0 or higher)
- **npm** or **yarn** package manager
- **Git** (for cloning the repository)

## Step 1: Database Setup

### 1.1 Create MySQL Database

```sql
-- Login to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE oopshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create a dedicated user (optional but recommended)
CREATE USER 'oopshop_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON oopshop.* TO 'oopshop_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### 1.2 Create Initial Manager Account

After running migrations (Step 2.4), create a manager account:

```sql
-- Login to MySQL
mysql -u root -p oopshop

-- Insert a manager (password: password123)
INSERT INTO managers (email, password_hash, first_name, last_name)
VALUES (
  'admin@oopshop.com',
  '$2b$10$rBV2GfHQvXN6YHLhQGxOTOKHY3jGKUzXJX3h0Q8kKZj6X7J0X7J0X',
  'Admin',
  'User'
);

-- Verify
SELECT id, email, first_name, last_name FROM managers;
```

Or use bcrypt to hash your password:
```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('your_password', 10);
console.log(hash);
```

## Step 2: Backend Setup

### 2.1 Navigate to Backend Directory

```bash
cd backend
```

### 2.2 Install Dependencies

```bash
npm install
```

This will install all required packages:
- express, cors, morgan (web server)
- mysql2 (database)
- bcrypt, jsonwebtoken (authentication)
- helmet, express-rate-limit (security)
- express-validator, joi (validation)
- winston (logging)
- swagger-jsdoc, swagger-ui-express (API docs)

### 2.3 Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Copy from example (if exists)
cp .env.example .env

# Or create manually
nano .env
```

Add the following configuration:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=oopshop
DB_CONNECTION_LIMIT=10

# JWT Configuration (CHANGE THIS!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_123456789
JWT_EXPIRES_IN=1d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important Security Notes:**
- Change `JWT_SECRET` to a random string (at least 32 characters)
- Never commit `.env` to version control
- Use different secrets for development and production

### 2.4 Run Database Migrations

```bash
npm run migrate
```

This creates all necessary tables:
- managers
- customers
- products
- invoices
- invoice_items
- payments

### 2.5 Create Logs Directory

```bash
mkdir -p logs
```

### 2.6 Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

### 2.7 Verify Backend

Open your browser and visit:
- Health check: http://localhost:3001/health
- API docs: http://localhost:3001/api-docs

You should see:
```json
{
  "status": "ok",
  "timestamp": "2025-12-18T..."
}
```

## Step 3: Frontend Setup

### 3.1 Open New Terminal

Keep the backend running and open a new terminal window.

### 3.2 Navigate to Frontend Directory

```bash
cd frontend
```

### 3.3 Install Dependencies

```bash
npm install
```

This will install:
- next, react, react-dom (framework)
- @mui/material, @emotion/react (UI components)
- TypeScript and types

### 3.4 Configure Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```bash
# Create file
nano .env.local
```

Add:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Environment
NODE_ENV=development
```

### 3.5 Start Frontend Server

```bash
npm run dev
```

### 3.6 Verify Frontend

Open your browser and visit:
- Homepage: http://localhost:3000

## Step 4: Testing the Application

### 4.1 Test Public Endpoints

1. **Browse Products:**
   - Go to http://localhost:3000/shop
   - Should see product list (may be empty initially)

2. **Test API Directly:**
```bash
# Get products
curl http://localhost:3001/products

# Health check
curl http://localhost:3001/health
```

### 4.2 Test Authentication

1. **Login via Frontend:**
   - Go to http://localhost:3000/login
   - Email: `admin@oopshop.com`
   - Password: `password123` (or your password)

2. **Login via API:**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@oopshop.com",
    "password": "password123"
  }'
```

Save the token from the response!

### 4.3 Test Protected Endpoints

```bash
# Replace YOUR_TOKEN with the JWT token from login
TOKEN="your_jwt_token_here"

# Create a product
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Product",
    "price": 9.99,
    "brand": "Test Brand",
    "category": "Test Category",
    "stock_quantity": 100
  }'
```

### 4.4 Test Checkout Flow

1. **Add products to cart** (frontend)
2. **Go to checkout** (http://localhost:3000/checkout)
3. **Fill in customer details**
4. **Complete checkout**
5. **View success page**

## Step 5: Explore API Documentation

### 5.1 Open Swagger UI

Visit: http://localhost:3001/api-docs

### 5.2 Authenticate in Swagger

1. Click **"Authorize"** button (top right)
2. Enter: `Bearer YOUR_JWT_TOKEN`
3. Click **"Authorize"**
4. Click **"Close"**

### 5.3 Test Endpoints

You can now test all API endpoints directly from Swagger UI!

## Common Issues and Solutions

### Issue: Cannot connect to MySQL

**Error:** `ER_ACCESS_DENIED_ERROR` or `ECONNREFUSED`

**Solutions:**
1. Check MySQL is running:
```bash
# macOS
brew services list

# Linux
sudo systemctl status mysql

# Windows
# Check Services app
```

2. Verify credentials in `.env` file
3. Test connection:
```bash
mysql -u root -p
```

### Issue: Port already in use

**Error:** `EADDRINUSE: address already in use :::3001`

**Solutions:**
1. Kill the process:
```bash
# Find process
lsof -i :3001

# Kill it
kill -9 <PID>
```

2. Change port in `.env`:
```env
PORT=3002
```

### Issue: JWT token invalid

**Error:** `Invalid or expired token`

**Solutions:**
1. Check `JWT_SECRET` matches in `.env`
2. Login again to get new token
3. Check token isn't expired

### Issue: CORS errors

**Error:** `Access-Control-Allow-Origin`

**Solutions:**
1. Check `CORS_ORIGIN` in backend `.env`
2. Ensure frontend URL matches exactly
3. Restart backend server

### Issue: Database migrations fail

**Error:** Various SQL errors

**Solutions:**
1. Drop and recreate database:
```sql
DROP DATABASE oopshop;
CREATE DATABASE oopshop;
```

2. Run migrations again:
```bash
npm run migrate
```

### Issue: Frontend build errors

**Error:** TypeScript or ESLint errors

**Solutions:**
1. Delete node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

2. Clear Next.js cache:
```bash
rm -rf .next
npm run dev
```

## Production Deployment

### Backend Production Setup

1. **Update environment:**
```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://yourdomain.com
```

2. **Use process manager:**
```bash
# Install PM2
npm install -g pm2

# Start app
pm2 start src/index.js --name oopshop-api

# Save process list
pm2 save

# Setup startup script
pm2 startup
```

3. **Setup reverse proxy (nginx):**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Frontend Production Setup

1. **Build the application:**
```bash
cd frontend
npm run build
```

2. **Start production server:**
```bash
npm start
```

3. **Or deploy to Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Monitoring

### Check Logs

**Backend logs:**
```bash
cd backend
tail -f logs/combined.log
tail -f logs/error.log
```

**Application status:**
```bash
# With PM2
pm2 status
pm2 logs oopshop-api
```

### Database Monitoring

```sql
-- Check connections
SHOW PROCESSLIST;

-- Check table sizes
SELECT 
    table_name,
    table_rows,
    data_length,
    index_length
FROM information_schema.tables
WHERE table_schema = 'oopshop';
```

## Backup and Restore

### Backup Database

```bash
# Create backup
mysqldump -u root -p oopshop > backup_$(date +%Y%m%d).sql

# Compressed backup
mysqldump -u root -p oopshop | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restore Database

```bash
# Restore from backup
mysql -u root -p oopshop < backup_20251218.sql

# Restore from compressed backup
gunzip < backup_20251218.sql.gz | mysql -u root -p oopshop
```

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use strong MySQL password
- [ ] Enable HTTPS in production
- [ ] Configure firewall rules
- [ ] Regular security updates
- [ ] Enable MySQL SSL
- [ ] Setup regular backups
- [ ] Monitor logs for suspicious activity
- [ ] Use environment variables (never hardcode secrets)
- [ ] Implement rate limiting (already configured)

## Next Steps

1. **Add sample products** via dashboard
2. **Test complete checkout flow**
3. **Explore API documentation**
4. **Customize frontend theme**
5. **Add your branding**
6. **Configure payment gateway** (future enhancement)

## Additional Resources

- **Architecture Documentation**: See `ARCHITECTURE.md`
- **Backend README**: See `backend/README.md`
- **Frontend README**: See `frontend/README.md`
- **API Documentation**: http://localhost:3001/api-docs

## Support

For issues or questions:
- Check the documentation files
- Review the logs
- Visit the API docs
- Contact: support@oopshop.com

---

**Congratulations!** 🎉 Your OOPshop application is now running!

