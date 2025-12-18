# 🔄 Database Migration Guide

## Quick Start

Follow these steps to migrate to the new unified authentication system:

---

## Step 1: Backup Database ⚠️

**IMPORTANT: Always backup first!**

```bash
# Windows (Command Prompt)
mysqldump -u root -p oopshop > oopshop_backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%.sql

# Or use MySQL Workbench:
# Server → Data Export → Select oopshop → Export to Self-Contained File
```

---

## Step 2: Stop Backend

Press `Ctrl+C` in your backend terminal.

---

## Step 3: Run Migrations

```bash
cd D:\Github\OOPshop\backend

# Create new users table
npm run migrate

# Migrate existing managers to users table
npm run migrate:users
```

**Expected Output:**
```
🔄 Starting migration: managers → users...

📊 Found 1 manager(s) to migrate:

✅ Migrated: manager@oopshop.com → users table (role: manager)

📦 Old managers table renamed to 'managers_backup'
💡 You can drop it later with: DROP TABLE managers_backup;

✅ Migration completed successfully!
```

---

## Step 4: Verify Migration

```bash
# Connect to MySQL
mysql -u root -p oopshop

# Check users table
SELECT email, role, is_active FROM users;

# Should show your migrated manager(s) with role='manager'
```

---

## Step 5: Restart Backend

```bash
npm run dev
```

**You should see:**
```
✅ Environment variables validated successfully
✅ Server is now listening on port 5000
🏥 Health check available at http://localhost:5000/health
Database connection established successfully
```

---

## Step 6: Test Login

### **Option 1: Test with Frontend**
1. Go to http://localhost:3000/login
2. Login with your manager credentials
3. Should work exactly as before!

### **Option 2: Test with API**
```bash
# Test login endpoint
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@oopshop.com",
    "password": "your_password"
  }'

# Should return token and user info with role
```

---

## 🆘 If Something Goes Wrong

### **Restore from Backup Table**
```sql
-- Connect to MySQL
mysql -u root -p oopshop

-- Rename tables back
RENAME TABLE managers_backup TO managers;
DROP TABLE users;
```

### **Restore from SQL File**
```bash
mysql -u root -p oopshop < oopshop_backup_YYYYMMDD.sql
```

---

## 🎯 What to Check

### **✅ Successful Migration Checklist:**
- [ ] `users` table exists with your manager
- [ ] Manager can login via frontend
- [ ] JWT token is returned
- [ ] Dashboard is accessible
- [ ] Products can be managed
- [ ] No console errors

### **❌ If Login Fails:**
1. Check email matches exactly: `SELECT * FROM users WHERE email='...'`
2. Check role is 'manager': Should see `role='manager'`
3. Check is_active is TRUE: Should see `is_active=1`
4. Check password was migrated: Hash should be present
5. Check backend logs for errors

---

## 🔑 Create Additional Users

### **Create Admin:**
```bash
npm run create-admin
# Follow prompts
```

### **Via API:**
```bash
POST http://localhost:5000/auth/register
{
  "email": "admin@oopshop.com",
  "password": "securepassword",
  "first_name": "Admin",
  "last_name": "User",
  "role": "admin"
}
```

---

## 📊 Database Cleanup (Optional)

After confirming everything works, you can remove the backup:

```sql
-- ONLY DO THIS AFTER VERIFYING EVERYTHING WORKS!
DROP TABLE managers_backup;
```

---

## 🎉 You're Done!

Your authentication system is now consolidated with role-based access control!

Next: See `AUTH_CONSOLIDATION.md` for details on new features.
