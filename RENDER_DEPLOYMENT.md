# 🚀 Render Deployment Guide

## Overview

Your OOPshop repository is **mostly compatible** with Render, but requires some configuration. This guide will help you deploy it successfully.

## ✅ What Works Out of the Box

- ✅ Backend Node.js service (Express API)
- ✅ Frontend Next.js service
- ✅ Environment variable configuration
- ✅ Health check endpoints
- ✅ Build scripts are present

## ⚠️ What Needs Configuration

1. **Database**: Render provides PostgreSQL by default, but your app uses MySQL
2. **Environment Variables**: Need to be set in Render dashboard
3. **Build Commands**: Need to be configured for monorepo structure
4. **CORS**: Needs to be updated for production URLs

## 📋 Deployment Steps

### Option 1: Using Render Blueprint (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Connect to Render**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Blueprint"
   - Connect your repository
   - Render will detect `render.yaml` and create services automatically

3. **Configure Environment Variables**:
   - Go to each service → Environment
   - Set the following variables:

   **Backend Service:**
   ```
   DB_HOST=your-mysql-host.com
   DB_PORT=3306
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password (mark as secret)
   DB_NAME=oopshop
   SKIP_MIGRATIONS=true (if using existing database)
   ```

   **Frontend Service:**
   ```
   NEXT_PUBLIC_API_URL=https://oopshop-backend.onrender.com
   ```

4. **Run Database Migrations**:
   - If using a new database, set `SKIP_MIGRATIONS=false`
   - Or manually run: `cd backend && npm run migrate` via Render Shell

### Option 2: Manual Deployment

#### Step 1: Deploy Backend

1. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your repository
   - Configure:
     - **Name**: `oopshop-backend`
     - **Environment**: `Node`
     - **Build Command**: `cd backend && npm install`
     - **Start Command**: `cd backend && npm start`
     - **Root Directory**: Leave empty (or set to `backend` if deploying from subdirectory)

2. **Set Environment Variables**:
   ```
   NODE_ENV=production
   PORT=5000 (auto-set by Render)
   DB_HOST=your-mysql-host.com
   DB_PORT=3306
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=oopshop
   DB_CONNECTION_LIMIT=10
   JWT_SECRET=your-secure-secret-key
   JWT_EXPIRES_IN=24h
   CORS_ORIGIN=https://oopshop-frontend.onrender.com
   SKIP_MIGRATIONS=false
   ```

3. **Health Check**:
   - Path: `/health`

#### Step 2: Deploy Frontend

1. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your repository
   - Configure:
     - **Name**: `oopshop-frontend`
     - **Environment**: `Node`
     - **Build Command**: `cd frontend && npm install && npm run build`
     - **Start Command**: `cd frontend && npm start`
     - **Root Directory**: Leave empty

2. **Set Environment Variables**:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://oopshop-backend.onrender.com
   PORT=3000 (auto-set by Render)
   ```

## 🗄️ Database Options

### Option 1: External MySQL (Recommended)

Use your existing remote MySQL database:

1. Set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in backend environment
2. Set `SKIP_MIGRATIONS=true` if database already has schema
3. Ensure database allows connections from Render's IPs

### Option 2: Render PostgreSQL (Requires Migration)

If you want to use Render's managed database:

1. **Create PostgreSQL Database**:
   - Click "New +" → "PostgreSQL"
   - Note the connection details

2. **Update Backend**:
   - Install `pg` instead of `mysql2`
   - Update database connection code
   - Migrate schema to PostgreSQL

### Option 3: External Database Service

Use services like:
- **PlanetScale** (MySQL-compatible)
- **Aiven** (MySQL)
- **AWS RDS** (MySQL)
- **DigitalOcean Managed Database** (MySQL)

## 🔧 Required Changes for Render

### 1. Update CORS Configuration

The backend needs to allow your Render frontend URL. Update `backend/src/config/security.js` or set in environment:

```env
CORS_ORIGIN=https://oopshop-frontend.onrender.com
```

Or allow multiple origins:
```env
CORS_ORIGIN=https://oopshop-frontend.onrender.com,https://your-custom-domain.com
```

### 2. Update Frontend API URL

Set in Render dashboard:
```env
NEXT_PUBLIC_API_URL=https://oopshop-backend.onrender.com
```

### 3. Database Migrations

**Option A: Auto-run migrations** (for new databases):
- Set `SKIP_MIGRATIONS=false` in backend environment
- Migrations will run on first deploy

**Option B: Manual migrations** (for existing databases):
- Set `SKIP_MIGRATIONS=true`
- Use Render Shell to run: `cd backend && npm run migrate`

### 4. Build Scripts

Ensure your `package.json` has:
- **Backend**: `"start": "node src/index.js"`
- **Frontend**: `"build": "next build"` and `"start": "next start"`

✅ These are already configured correctly!

## 📝 Environment Variables Checklist

### Backend Service
- [ ] `NODE_ENV=production`
- [ ] `PORT` (auto-set by Render)
- [ ] `DB_HOST` (your MySQL host)
- [ ] `DB_PORT=3306`
- [ ] `DB_USER` (your database user)
- [ ] `DB_PASSWORD` (mark as secret)
- [ ] `DB_NAME` (your database name)
- [ ] `DB_CONNECTION_LIMIT=10`
- [ ] `JWT_SECRET` (generate secure random string)
- [ ] `JWT_EXPIRES_IN=24h`
- [ ] `CORS_ORIGIN` (your frontend URL)
- [ ] `SKIP_MIGRATIONS` (true/false)

### Frontend Service
- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_API_URL` (your backend URL)
- [ ] `PORT` (auto-set by Render)

## 🚨 Common Issues & Solutions

### Issue: Build Fails - "Cannot find module"

**Solution**: Ensure build commands include `cd backend` or `cd frontend`:
```yaml
buildCommand: cd backend && npm install
```

### Issue: Database Connection Refused

**Solutions**:
1. Check `DB_HOST` is correct (not `localhost`)
2. Ensure database allows external connections
3. Check firewall rules
4. Verify credentials are correct

### Issue: CORS Errors

**Solution**: Update `CORS_ORIGIN` in backend to match your frontend URL:
```env
CORS_ORIGIN=https://oopshop-frontend.onrender.com
```

### Issue: Frontend Can't Connect to Backend

**Solution**: 
1. Check `NEXT_PUBLIC_API_URL` is set correctly
2. Ensure backend is deployed and healthy
3. Check backend URL is accessible

### Issue: Migrations Not Running

**Solution**:
1. Set `SKIP_MIGRATIONS=false` for new databases
2. Or use Render Shell: `cd backend && npm run migrate`

## 🔒 Security Best Practices

1. **Mark sensitive variables as secrets** in Render dashboard
2. **Use strong JWT_SECRET** (generate with: `openssl rand -base64 32`)
3. **Enable HTTPS** (Render provides this automatically)
4. **Set proper CORS_ORIGIN** (don't use `*` in production)
5. **Use environment-specific secrets**

## 📊 Monitoring

Render provides:
- **Logs**: View in dashboard
- **Metrics**: CPU, Memory, Request rates
- **Health Checks**: Automatic monitoring
- **Alerts**: Email notifications

## 🎯 Quick Deploy Checklist

- [ ] Code pushed to Git repository
- [ ] Render account created
- [ ] Backend service created
- [ ] Frontend service created
- [ ] Environment variables set
- [ ] Database configured (external MySQL)
- [ ] CORS_ORIGIN set to frontend URL
- [ ] NEXT_PUBLIC_API_URL set to backend URL
- [ ] Migrations run (if needed)
- [ ] Health checks passing
- [ ] Test deployment

## 🚀 Post-Deployment

1. **Test Health Endpoints**:
   - Backend: `https://oopshop-backend.onrender.com/health`
   - Frontend: `https://oopshop-frontend.onrender.com`

2. **Test API**:
   ```bash
   curl https://oopshop-backend.onrender.com/health
   ```

3. **Create Admin User**:
   - Use Render Shell: `cd backend && npm run create-admin`

4. **Access Swagger Docs**:
   - `https://oopshop-backend.onrender.com/api-docs`

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Node.js Best Practices](https://render.com/docs/node-best-practices)

## ✅ Compatibility Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Backend API | ✅ Compatible | Works with minor config |
| Frontend Next.js | ✅ Compatible | Standard Next.js deployment |
| MySQL Database | ⚠️ External Required | Use external MySQL service |
| Environment Variables | ✅ Compatible | Standard .env support |
| Build Process | ✅ Compatible | Standard npm scripts |
| Health Checks | ✅ Compatible | `/health` endpoint exists |
| CORS | ⚠️ Needs Config | Set CORS_ORIGIN for production |

**Overall**: Your repo is **90% ready** for Render. Just need to:
1. Set environment variables
2. Configure database connection
3. Update CORS settings

