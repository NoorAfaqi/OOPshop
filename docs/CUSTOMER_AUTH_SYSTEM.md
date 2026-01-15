# 🔐 Customer Authentication System

## ✅ Complete Customer Auth System Implemented!

Your OOPshop now has a **full-featured authentication system** for customers, separate from the hidden manager/admin portal.

---

## 🎯 **Authentication Flow**

### **For Customers:**
```
Homepage → Sign In → Login/Register → Account Page
   ↓
Shop → Add to Cart → Checkout (Guest OR Sign In)
   ↓
If Signed In: Track orders in Account Page
If Guest: One-time checkout, no account
```

### **For Managers/Admins (Hidden):**
```
Direct URL: /login → Dashboard
```

---

## 📍 **Customer Pages**

### **1. Sign In Page** (`/signin`)
- **URL:** `http://localhost:3000/signin`
- **Features:**
  - Email & password login
  - Works for ALL user types (customer, manager, admin)
  - Redirects customers to `/account`
  - Redirects managers/admins to `/dashboard`
  - Link to sign up page
  - Modern, clean UI

### **2. Sign Up Page** (`/signup`)
- **URL:** `http://localhost:3000/signup`
- **Features:**
  - Customer registration form
  - First name, last name, email, phone, password
  - Password confirmation validation
  - Automatically creates user with `role='customer'`
  - Redirects to sign in after successful registration
  - Link to sign in page

### **3. Account Page** (`/account`)
- **URL:** `http://localhost:3000/account`
- **Features:**
  - View profile information
  - See all orders/invoices
  - Order history with details
  - Logout button
  - Protected route (requires authentication)
  - Redirects to sign in if not authenticated

---

## 🔑 **Backend API Endpoints**

### **Authentication:**
```javascript
POST   /auth/login           // Login (all user types)
POST   /auth/register        // Register new customer
GET    /auth/me              // Get current user (protected)
POST   /auth/change-password // Change password (protected)
```

### **User Management:**
```javascript
GET    /users/:id            // Get user by ID (protected)
GET    /users/:id/invoices   // Get user's orders (protected)
GET    /users/:id/payments   // Get user's payments (protected)
PUT    /users/:id            // Update user (protected)
```

---

## 🎨 **User Experience**

### **Customer Navigation:**
```
Homepage
  ├── Shop (visible)
  └── Sign In (visible)

Shop Page
  ├── Home (visible)
  ├── Sign In (visible)
  └── Cart (visible)

Signed In:
  ├── Shop
  ├── Account (shows name)
  └── Logout
```

### **Guest vs Customer:**

| Feature | Guest | Customer (Signed In) |
|---------|-------|---------------------|
| Browse products | ✅ | ✅ |
| Add to cart | ✅ | ✅ |
| Checkout | ✅ | ✅ |
| Track orders | ❌ | ✅ |
| Order history | ❌ | ✅ |
| Saved info | ❌ | ✅ |
| Manage account | ❌ | ✅ |

---

## 🔒 **Security Features**

### **Authentication:**
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Token stored in localStorage
- ✅ Token sent in Authorization header
- ✅ Protected routes check authentication
- ✅ Role-based access control

### **Validation:**
- ✅ Email format validation
- ✅ Password minimum 6 characters
- ✅ Password confirmation match
- ✅ Required fields validation
- ✅ Duplicate email prevention

### **Rate Limiting:**
- ✅ 5 login attempts per 15 minutes
- ✅ Applied to all auth routes
- ✅ Prevents brute force attacks

---

## 🚀 **How to Use**

### **1. Customer Registration:**
```
1. Go to http://localhost:3000/signup
2. Fill in details:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Phone: 123-456-7890 (optional)
   - Password: password123
   - Confirm Password: password123
3. Click "Create Account"
4. Redirected to /signin
5. Sign in with credentials
```

### **2. Customer Login:**
```
1. Go to http://localhost:3000/signin
2. Enter email & password
3. Click "Sign In"
4. Redirected to /account
5. View profile & orders
```

### **3. Shopping While Signed In:**
```
1. Browse /shop
2. Add products to cart
3. Go to /checkout
4. Checkout form auto-fills with saved info
5. Complete order
6. Order appears in /account
```

### **4. Guest Checkout:**
```
1. Browse /shop (no sign in)
2. Add products to cart
3. Go to /checkout
4. Select "Guest Checkout"
5. Fill billing info
6. Complete order
7. User created with role='guest'
8. No account access
```

---

## 📊 **User Roles**

### **Customer** (`role='customer'`)
- Created via `/signup` or checkout with email
- Can sign in at `/signin`
- Has account page at `/account`
- Can view order history
- Can update profile
- Can change password

### **Guest** (`role='guest'`)
- Created via guest checkout
- No email/password
- Cannot sign in
- One-time purchase only
- No order tracking

### **Manager** (`role='manager'`)
- Access via hidden `/login`
- Dashboard access
- Product management
- Cannot access `/account`

### **Admin** (`role='admin'`)
- Access via hidden `/login`
- Full system access
- User management
- Cannot access `/account`

---

## 🔄 **Authentication State Management**

### **Storage:**
```javascript
localStorage.setItem("auth_token", token);      // JWT token
localStorage.setItem("user_data", JSON.stringify(user));  // User object
```

### **Protected Routes:**
```javascript
// Check authentication
const token = localStorage.getItem("auth_token");
if (!token) {
  router.push("/signin");
  return;
}

// Include in API requests
headers: {
  Authorization: `Bearer ${token}`
}
```

### **Logout:**
```javascript
localStorage.removeItem("auth_token");
localStorage.removeItem("user_data");
router.push("/");
```

---

## 📁 **Files Structure**

### **Frontend:**
```
frontend/
├── app/
│   ├── signin/
│   │   └── page.tsx           ✅ Customer sign in
│   ├── signup/
│   │   └── page.tsx           ✅ Customer registration
│   ├── account/
│   │   └── page.tsx           ✅ Customer account/orders
│   ├── login/
│   │   └── page.tsx           🔒 Manager/Admin (hidden)
│   └── dashboard/
│       └── ...                🔒 Manager/Admin (hidden)
└── lib/
    ├── config/
    │   └── api.config.ts      ✅ API endpoints
    ├── services/
    │   ├── auth.service.ts    ✅ Auth service
    │   └── user.service.ts    ✅ User service
    └── hooks/
        └── useAuth.ts         ✅ Auth hook
```

### **Backend:**
```
backend/
└── src/
    ├── routes/
    │   └── auth.routes.js     ✅ Auth endpoints
    ├── controllers/
    │   └── auth.controller.js ✅ Auth logic
    ├── services/
    │   └── auth.service.js    ✅ User auth & registration
    ├── validators/
    │   └── auth.validator.js  ✅ Input validation
    └── middleware/
        └── auth.js            ✅ JWT verification
```

---

## 🧪 **Testing**

### **Test Customer Registration:**
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "Customer",
    "phone": "123-456-7890",
    "role": "customer"
  }'
```

### **Test Customer Login:**
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "password123"
  }'
```

### **Test Get User Orders:**
```bash
# Replace TOKEN and USER_ID
curl http://localhost:5000/users/1/invoices \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ **Features Implemented**

### **Customer Features:**
- ✅ Registration page with validation
- ✅ Login page (unified for all user types)
- ✅ Account page with profile & orders
- ✅ Order history display
- ✅ Logout functionality
- ✅ Protected routes
- ✅ Token-based authentication
- ✅ Role-based redirects

### **Backend Features:**
- ✅ `/auth/register` endpoint
- ✅ `/auth/login` endpoint (all roles)
- ✅ `/auth/me` endpoint
- ✅ `/auth/change-password` endpoint
- ✅ User order retrieval
- ✅ JWT token generation
- ✅ Password hashing
- ✅ Email uniqueness check
- ✅ Role validation

### **UI/UX:**
- ✅ Modern, clean design
- ✅ Consistent with shop aesthetic
- ✅ Responsive layout
- ✅ Loading states
- ✅ Error messages
- ✅ Success feedback
- ✅ Smooth transitions

---

## 🎯 **Complete User Flows**

### **Flow 1: New Customer Registration**
```
1. Visit /shop
2. Click "Sign In" in navigation
3. Click "Sign Up" link
4. Fill registration form
5. Submit → Account created
6. Redirect to /signin
7. Sign in with credentials
8. Redirect to /account
9. Start shopping with tracked orders
```

### **Flow 2: Returning Customer**
```
1. Visit /shop
2. Click "Sign In"
3. Enter email & password
4. Submit → Authenticated
5. Redirect to /account
6. View past orders
7. Continue shopping
```

### **Flow 3: Guest Checkout**
```
1. Visit /shop (no sign in)
2. Browse & add to cart
3. Go to /checkout
4. Select "Guest Checkout"
5. Fill billing info (no email)
6. Complete order
7. Guest user created (no sign in access)
```

### **Flow 4: Customer Checkout**
```
1. Sign in at /signin
2. Browse /shop
3. Add to cart
4. Go to /checkout
5. Select "Create Account"
6. Enter email + billing info
7. Complete order
8. Order tracked in /account
```

---

## 🔐 **Security Best Practices**

### **Implemented:**
✅ JWT tokens with expiration (1 day)
✅ bcrypt password hashing (10 rounds)
✅ Rate limiting on auth endpoints
✅ Input validation (express-validator)
✅ SQL injection prevention (parameterized queries)
✅ XSS protection (Helmet middleware)
✅ CORS configuration
✅ Token verification on protected routes
✅ Role-based access control

### **Recommended for Production:**
- [ ] HTTPS only
- [ ] Token refresh mechanism
- [ ] Password strength requirements
- [ ] Email verification
- [ ] Password reset flow
- [ ] 2FA for sensitive accounts
- [ ] Session timeout
- [ ] Account lockout after failed attempts
- [ ] Audit logging

---

## 📚 **API Response Examples**

### **Successful Registration:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "id": 5,
    "email": "customer@test.com",
    "first_name": "Test",
    "last_name": "Customer",
    "role": "customer"
  }
}
```

### **Successful Login:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 5,
      "email": "customer@test.com",
      "first_name": "Test",
      "last_name": "Customer",
      "role": "customer"
    }
  }
}
```

### **Get User Orders:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "total_amount": 45.99,
      "status": "paid",
      "created_at": "2025-12-18T10:30:00Z",
      "items": "Product A x2, Product B x1"
    }
  ]
}
```

---

## 🎉 **Summary**

✅ **Complete customer authentication system**
✅ **Sign in page for customers**
✅ **Sign up page for registration**
✅ **Account page with order history**
✅ **Protected routes with JWT**
✅ **Role-based access control**
✅ **Modern, clean UI**
✅ **Secure password handling**
✅ **Input validation**
✅ **Rate limiting**
✅ **Separate from admin portal**

**Your customers can now:**
- Create accounts
- Sign in
- Track orders
- Manage profiles
- Enjoy seamless shopping experience

**While managers/admins access the hidden portal at `/login`!** 🔒
