# 🎯 Single Users Table Consolidation Complete!

## ✅ What Changed

**Consolidated ALL user-related data into a single `users` table!**

### **Before:**
```
❌ managers table → Manager authentication
❌ customers table → Customer billing info
❌ users table → (didn't exist or was separate)
```

### **After:**
```
✅ users table → Everything in ONE place!
   ├── Authentication (email, password_hash)
   ├── User Info (name, phone)
   ├── Roles (admin, manager, customer, guest)
   ├── Billing Info (street, zip, city, country)
   └── Status (is_active, timestamps)
```

---

## 🗄️ Single Users Table Schema

```sql
CREATE TABLE users (
  -- Authentication
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE,          -- Optional for guests
  password_hash VARCHAR(255),         -- Optional for guests
  
  -- User Info
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  
  -- Role & Status
  role ENUM('admin', 'manager', 'customer', 'guest') DEFAULT 'customer',
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Billing Info (filled during checkout)
  billing_street VARCHAR(255),
  billing_zip VARCHAR(20),
  billing_city VARCHAR(100),
  billing_country VARCHAR(100),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_role (role)
);
```

---

## 🚀 How to Apply Changes

### **Step 1: Clear Database (Since you already cleared it)**
You're good to go!

### **Step 2: Run Migration**
```bash
cd D:\Github\OOPshop\backend
npm run migrate
```

This creates:
- ✅ `users` table (with billing fields)
- ✅ `products` table
- ✅ `invoices` table (with `user_id` FK)
- ✅ `invoice_items` table
- ✅ `payments` table (with `user_id` FK)

**NO customers or managers tables!**

### **Step 3: Create Admin User**
```bash
npm run create-admin
```

Follow prompts to create your admin account.

### **Step 4: Restart Backend**
```bash
npm run dev
```

---

## 📊 Database Structure

### **All Tables:**
1. **users** - Single source of truth for all users
2. **products** - Product catalog
3. **invoices** - Orders (references `user_id`)
4. **invoice_items** - Order line items
5. **payments** - Payment transactions (references `user_id`)

### **Foreign Keys:**
- `invoices.user_id` → `users.id`
- `payments.user_id` → `users.id`
- `invoice_items.invoice_id` → `invoices.id`
- `invoice_items.product_id` → `products.id`
- `payments.invoice_id` → `invoices.id`

---

## 🎯 User Types

### **1. Admin** (`role='admin'`)
- Full system access
- Manage all users, products, invoices
- Access all reports

### **2. Manager** (`role='manager'`)
- Product management
- View/manage invoices
- Access reports
- Cannot manage users

### **3. Customer** (`role='customer'`)
- Browse & shop
- Has account with email/password
- Can view own orders

### **4. Guest** (`role='guest'`)
- One-time checkout
- No email/password required
- Limited to single purchase

---

## 🛒 Checkout Flow

### **Guest Checkout:**
```javascript
POST /checkout
{
  // No email provided
  "first_name": "John",
  "last_name": "Doe",
  "phone": "123-456-7890",
  "billing_street": "123 Main St",
  "billing_zip": "12345",
  "billing_city": "City",
  "billing_country": "USA",
  "items": [...]
}
// Creates user with role='guest', no email/password
```

### **Customer Checkout:**
```javascript
POST /checkout
{
  "email": "customer@example.com",  // Email provided
  "first_name": "Jane",
  "last_name": "Smith",
  // ... rest of billing info
  "items": [...]
}
// If email exists: Updates user's billing info
// If email new: Creates user with role='customer'
```

---

## 📝 Files Changed

### **Services Updated:**
- ✅ `services/checkout.service.js` - Now creates/updates users
- ✅ `services/invoice.service.js` - Uses `user_id` instead of `customer_id`
- ✅ `services/payment.service.js` - Uses `user_id` instead of `customer_id`
- ✅ `services/auth.service.js` - Enhanced user management

### **Routes Updated:**
- ✅ `routes/users.js` - New user management routes
- ✅ `routes/invoices.js` - Updated validators
- ✅ `routes/payments.js` - Updated validators

### **Validators Updated:**
- ✅ `validators/checkout.validator.js` - Email is optional now
- ✅ `validators/invoice.validator.js` - Uses `user_id`
- ✅ `validators/payment.validator.js` - Uses `user_id`

### **Files Deleted:**
- ❌ `services/customer.service.js` - No longer needed
- ❌ `controllers/customer.controller.js` - No longer needed
- ❌ `validators/customer.validator.js` - No longer needed

---

## 🔑 API Endpoints

### **Authentication:**
- `POST /auth/login` - Login
- `POST /auth/register` - Register new user
- `GET /auth/me` - Get current user
- `POST /auth/change-password` - Change password

### **Users:**
- `GET /users` - List all users (admin only)
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `GET /users/:id/invoices` - Get user's orders
- `GET /users/:id/payments` - Get user's payments

### **Products:**
- `GET /products` - List products
- `POST /products` - Create product (manager+)
- etc.

### **Checkout:**
- `POST /checkout` - Process checkout (creates/updates user + invoice)

### **Invoices:**
- `GET /invoices` - List invoices
- `GET /invoices/:id` - Get invoice details
- `POST /invoices` - Create invoice (uses `user_id`)
- etc.

---

## ✅ Benefits

### **Before:**
- ❌ 3 separate tables for users
- ❌ Data scattered across tables
- ❌ Complex joins required
- ❌ Duplicate user information
- ❌ Hard to manage

### **After:**
- ✅ ONE table for everything
- ✅ All user data in one place
- ✅ Simple queries
- ✅ No duplication
- ✅ Easy to manage
- ✅ Supports multiple user types
- ✅ Guest checkout possible
- ✅ Cleaner codebase

---

## 🧪 Testing

### **1. Create Admin:**
```bash
npm run create-admin
# Email: admin@oopshop.com
# Password: admin123
```

### **2. Login as Admin:**
```bash
POST http://localhost:5000/auth/login
{
  "email": "admin@oopshop.com",
  "password": "admin123"
}
```

### **3. Test Checkout (Guest):**
```bash
POST http://localhost:5000/checkout
{
  "first_name": "Guest",
  "last_name": "User",
  "billing_street": "123 St",
  "billing_zip": "12345",
  "billing_city": "City",
  "billing_country": "USA",
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ]
}
# Creates guest user automatically
```

### **4. Test Checkout (Customer with Email):**
```bash
POST http://localhost:5000/checkout
{
  "email": "customer@example.com",
  "first_name": "Customer",
  "last_name": "User",
  "billing_street": "456 Ave",
  "billing_zip": "67890",
  "billing_city": "Town",
  "billing_country": "USA",
  "items": [...]
}
# Creates customer user with email
```

---

## 🎉 Summary

✅ **Single `users` table for ALL user types**
✅ **Supports admin, manager, customer, guest roles**
✅ **Includes billing information**
✅ **Foreign keys updated to reference users**
✅ **Guest checkout without email**
✅ **Customer checkout with email**
✅ **Clean, simple database structure**
✅ **No duplicate data**

**Your database is now consolidated, clean, and efficient!** 🚀

---

## 📚 Next Steps

1. Run `npm run migrate`
2. Create admin user: `npm run create-admin`
3. Restart backend: `npm run dev`
4. Test authentication & checkout
5. Start building your application!

**Everything is ready to go!** ✨
