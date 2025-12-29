# Web and Mobile Backend Setup Guide

## ✅ Changes Made

The backend has been updated to work seamlessly with both **web browsers** and **mobile apps**.

### 1. **Enhanced CORS Configuration**

The CORS configuration now supports:
- ✅ **Single web origin** (e.g., `http://localhost:3000`)
- ✅ **Multiple origins** (comma-separated for web + staging + production)
- ✅ **All origins** (for development/testing with mobile apps)
- ✅ **Mobile apps** (work automatically - CORS doesn't apply to native apps)

### 2. **Re-enabled Security Features**

- ✅ Helmet security headers
- ✅ Rate limiting
- ✅ Request logging
- ✅ Swagger API documentation

---

## 🔧 Configuration Options

### Option 1: Single Web Origin (Default)
```env
CORS_ORIGIN=http://localhost:3000
```
**Use when:** Only web frontend needs access

### Option 2: Multiple Origins (Web + Staging + Production)
```env
CORS_ORIGIN=http://localhost:3000,https://staging.yourapp.com,https://yourapp.com
```
**Use when:** Multiple web deployments need access

### Option 3: Allow All Origins (Development)
```env
CORS_ORIGIN=*
```
**Or simply:**
```env
# Leave CORS_ORIGIN empty in development
```
**Use when:** Testing with mobile apps or multiple clients

### Option 4: Production with Specific Origins
```env
NODE_ENV=production
CORS_ORIGIN=https://yourapp.com,https://www.yourapp.com
```
**Use when:** Production deployment with security restrictions

---

## 📱 Mobile App Integration

### How It Works

**Mobile apps don't use CORS** (CORS is a browser security feature). Mobile apps can connect to the backend regardless of CORS settings, but the backend will still send appropriate headers.

### Mobile App Configuration

1. **Set API Base URL:**
   ```javascript
   // React Native / Flutter / Native
   const API_BASE_URL = "http://your-server.com:5000";
   // or
   const API_BASE_URL = "https://api.yourapp.com";
   ```

2. **Authentication:**
   ```javascript
   // Login
   POST /auth/login
   Headers: { "Content-Type": "application/json" }
   Body: { "email": "user@example.com", "password": "password123" }
   
   // Response includes JWT token
   {
     "status": "success",
     "data": {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "user": { ... }
     }
   }
   
   // Use token in all authenticated requests
   Headers: { 
     "Authorization": "Bearer {token}",
     "Content-Type": "application/json"
   }
   ```

3. **Example API Call:**
   ```javascript
   // Fetch products
   GET /products
   Headers: { "Authorization": "Bearer {token}" }
   ```

---

## 🌐 Web Frontend Integration

### How It Works

**Web browsers require CORS** headers. The backend now properly handles CORS for web requests.

### Web Frontend Configuration

1. **Set API Base URL:**
   ```typescript
   // frontend/lib/config/api.config.ts
   const API_BASE_URL = "http://localhost:5000";
   ```

2. **CORS Headers:**
   - Automatically handled by backend
   - Credentials (cookies) are supported
   - Preflight requests (OPTIONS) are handled

3. **Authentication:**
   - Same JWT token flow as mobile
   - Store token in localStorage or secure storage
   - Include in Authorization header

---

## 🧪 Testing

### Test Web Frontend
```bash
# Start backend
cd backend
npm run dev

# Start frontend
cd frontend
npm run dev

# Access at http://localhost:3000
```

### Test Mobile App (cURL)
```bash
# Test login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test authenticated request
curl -X GET http://localhost:5000/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test with Postman
1. Create requests with `Authorization: Bearer {token}` header
2. Works for both web and mobile testing
3. No CORS restrictions in Postman

---

## 🔒 Security Notes

### Development
- CORS allows all origins (or specific localhost)
- Rate limiting: 100 requests per 15 minutes
- Helmet security headers enabled

### Production
- **Recommended:** Set specific CORS origins
- **Rate limiting:** Adjust based on expected traffic
- **Helmet:** Full security headers enabled
- **HTTPS:** Use HTTPS in production

---

## 📋 Environment Variables

### Complete .env Example

```env
# Server Configuration
PORT=5000
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

# CORS Configuration (supports web + mobile)
# Development: Allow all or leave empty
CORS_ORIGIN=*
# OR for specific origins:
# CORS_ORIGIN=http://localhost:3000,https://yourapp.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## ✅ Verification Checklist

- [x] CORS supports multiple origins
- [x] Mobile apps can connect (CORS not required)
- [x] Web browsers can connect (CORS headers sent)
- [x] Security middleware enabled
- [x] Rate limiting enabled
- [x] Logging enabled
- [x] Swagger documentation available
- [x] JWT authentication works for both web and mobile
- [x] All API endpoints accessible

---

## 🚀 Quick Start

1. **Update .env file:**
   ```env
   CORS_ORIGIN=*  # or specific origins
   ```

2. **Start backend:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Test endpoints:**
   - Health: `http://localhost:5000/health`
   - API Docs: `http://localhost:5000/api-docs`
   - Login: `POST http://localhost:5000/auth/login`

4. **Connect your clients:**
   - Web frontend: Works with CORS headers
   - Mobile app: Works directly (no CORS needed)

---

## 📚 API Endpoints

All endpoints work for both web and mobile:

### Public Endpoints
- `GET /health` - Health check
- `GET /products` - List products
- `GET /products/:id` - Get product details
- `POST /auth/login` - Login
- `POST /auth/register` - Register
- `POST /checkout` - Process checkout

### Protected Endpoints (Require JWT Token)
- `GET /auth/me` - Get current user
- `GET /invoices` - List invoices
- `GET /reports` - Get reports
- `GET /account/me` - Get profile
- `PUT /account/me` - Update profile
- And more...

---

## 🎉 Your Backend is Now Ready!

✅ **Web browsers** - CORS properly configured  
✅ **Mobile apps** - Direct access, no CORS needed  
✅ **Security** - All middleware enabled  
✅ **Documentation** - Swagger available at `/api-docs`

Both web and mobile clients can now use the same backend API!

