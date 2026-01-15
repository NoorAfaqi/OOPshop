# 🔒 Security & Access Control

## Manager/Admin Portal Access

### **Design Philosophy**

The manager and admin portal is designed to be **"hidden"** - accessible but not advertised on customer-facing pages.

---

## 🎯 **Access Method**

### **Direct URL Access:**
```
Manager/Admin Login:  http://localhost:3000/login
Admin Dashboard:      http://localhost:3000/dashboard
```

**These URLs are NOT linked from:**
- ❌ Homepage
- ❌ Shop page
- ❌ Cart page
- ❌ Checkout page
- ❌ Any customer-facing navigation

### **Why?**
- ✅ Reduces attack surface
- ✅ Prevents casual discovery
- ✅ Keeps customer interface clean
- ✅ Separates customer and admin experiences
- ✅ Security through obscurity (additional layer, not primary)

---

## 🔐 **Authentication & Authorization**

### **Backend Protection:**

All admin/manager routes are protected by:

1. **JWT Authentication** - Valid token required
2. **Role-Based Access Control (RBAC)** - Proper role verification
3. **Middleware Protection** - `requireAdmin()`, `requireManager()`, `requireAuth()`

```javascript
// Example: Admin-only route
router.get("/users", requireAdmin(), userController.getAllUsers);

// Example: Manager+ route
router.post("/products", requireManager(), productController.createProduct);
```

### **Frontend Protection:**

Dashboard routes are protected by:

1. **Auth Check** - `useAuth()` hook verifies authentication
2. **Route Guards** - Redirects to login if not authenticated
3. **Token Verification** - Backend validates JWT on each request

---

## 👥 **User Roles**

### **1. Admin (`role='admin'`)**
- Full system access
- Manage all users
- Manage products
- View all orders & reports
- Access all API endpoints

**Access:** Direct login at `/login`

### **2. Manager (`role='manager'`)**
- Product management
- View/manage invoices
- Access reports
- Cannot manage users

**Access:** Direct login at `/login`

### **3. Customer (`role='customer'`)**
- Browse products
- Place orders
- View own order history
- Public shop interface

**Access:** No login button visible (can register at checkout)

### **4. Guest (`role='guest'`)**
- One-time checkout
- No account required
- No login capability

**Access:** Guest checkout only

---

## 🚪 **Hidden URLs**

### **Admin/Manager URLs (Not Linked Publicly):**
```
/login                      - Manager/Admin login
/dashboard                  - Dashboard home
/dashboard/products         - Product management
/dashboard/import-product   - Import from barcode
```

### **Customer URLs (Publicly Linked):**
```
/                    - Homepage
/shop                - Product catalog
/shop/:id            - Product details
/cart                - Shopping cart
/checkout            - Checkout page
/checkout/success    - Order confirmation
```

---

## 🛡️ **Security Best Practices**

### **Current Implementation:**

✅ **No visible links to admin portal**
- Clean customer interface
- Admin access via direct URL only

✅ **JWT-based authentication**
- Token expires after session
- Token stored in localStorage
- Token validated on every request

✅ **Role-based access control**
- Backend enforces role checks
- Different permissions for admin/manager/customer

✅ **Input validation**
- express-validator on all routes
- Joi schemas for data validation
- SQL injection prevention (parameterized queries)

✅ **Security middleware**
- Helmet for HTTP headers
- CORS configuration
- Rate limiting on auth routes
- XSS protection

✅ **Password security**
- bcrypt hashing (10 rounds)
- Minimum 32-char JWT secret
- No plaintext password storage

---

## 📝 **Additional Security Recommendations**

### **For Production:**

1. **Add CAPTCHA** to login page
   - Prevent brute force attacks
   - Google reCAPTCHA v3

2. **Implement rate limiting on login**
   - Already implemented: 5 attempts per 15 min
   - Consider IP-based blocking

3. **Add 2FA (Two-Factor Authentication)**
   - SMS or authenticator app
   - Required for admin accounts

4. **Enable HTTPS**
   - All traffic encrypted
   - Force HTTPS redirect

5. **Session management**
   - Token refresh mechanism
   - Automatic logout after inactivity
   - Device tracking

6. **Audit logging**
   - Log all admin actions
   - Track login attempts
   - Monitor suspicious activity

7. **Hide error details in production**
   - Generic error messages
   - Detailed logs server-side only

8. **Database security**
   - Use database user with minimal permissions
   - Separate admin and read-only connections
   - Regular backups

9. **Custom login URL**
   - Change `/login` to something unique
   - Example: `/admin-portal-2024` or random string
   - Update only in documentation, not in code comments

10. **IP Whitelist (Optional)**
    - Restrict admin access to specific IPs
    - VPN requirement for remote access

---

## 🔍 **How to Access Admin Portal**

### **Step 1: Create Admin Account**
```bash
cd backend
npm run create-admin
# Follow prompts
```

### **Step 2: Access Login Page**
```
1. Open browser
2. Navigate to: http://localhost:3000/login
3. Enter admin credentials
4. Access granted to dashboard
```

### **Step 3: Manage System**
```
Dashboard features:
- View sales metrics
- Manage products
- View orders
- Import products via barcode
- Generate reports
```

---

## 🚫 **What Customers See**

### **Customer Experience:**
```
Homepage (/) 
  ↓
  "Start Shopping" button
  ↓
Shop Page (/shop)
  ↓
  Add to Cart
  ↓
Cart Page (/cart)
  ↓
Checkout (/checkout)
  ↓
  Guest Checkout OR Create Account
  ↓
Success Page

NO MENTION OF ADMIN/MANAGER ACCESS
```

### **No Hints About:**
- ❌ Login page existence
- ❌ Dashboard access
- ❌ Admin capabilities
- ❌ Management features

---

## ✅ **Verification Checklist**

### **Customer Pages (Public):**
- [ ] Homepage has NO login/manager buttons
- [ ] Shop page has NO login/manager buttons
- [ ] Cart page has NO admin links
- [ ] Checkout has NO admin references
- [ ] Footer has NO admin links

### **Admin Pages (Hidden):**
- [ ] `/login` accessible by direct URL
- [ ] `/dashboard` requires authentication
- [ ] Dashboard redirects to login if not authenticated
- [ ] All admin routes check JWT token
- [ ] All admin routes verify role

### **API Security:**
- [ ] Admin endpoints require `requireAdmin()`
- [ ] Manager endpoints require `requireManager()`
- [ ] Protected routes require `requireAuth()`
- [ ] JWT validation works
- [ ] Rate limiting active

---

## 📚 **Documentation**

- **Backend Security:** See `backend/src/config/security.js`
- **Auth Middleware:** See `backend/src/middleware/auth.js`
- **RBAC Implementation:** See `backend/src/services/auth.service.js`
- **Frontend Auth:** See `frontend/lib/hooks/useAuth.ts`

---

## 🎯 **Summary**

✅ **Admin portal is "hidden"**
- No links on customer pages
- Accessible via direct URL only

✅ **Multi-layer security**
- JWT authentication
- Role-based access control
- Input validation
- Rate limiting

✅ **Clean customer experience**
- No clutter from admin features
- Focus on shopping

✅ **Professional separation**
- Customer interface: Public, clean, simple
- Admin interface: Hidden, powerful, secure

**Security through proper authentication, not just obscurity!** 🔒
