# Docker Setup Guide

This project includes Docker configuration for both development and production environments.

## Prerequisites

1. **Docker Desktop** must be installed and running
   - Download from: https://www.docker.com/products/docker-desktop
   - Make sure Docker Desktop is running before building

2. **Environment Variables** (optional)
   - Create a `.env` file in the root directory if you need custom configuration
   - Default values are provided in docker-compose files

## Quick Start

### Development Environment

**Windows (PowerShell):**
```powershell
.\docker-build-dev.ps1
```

**Linux/Mac:**
```bash
chmod +x docker-build-dev.sh
./docker-build-dev.sh
```

**Manual:**
```bash
docker-compose build
docker-compose up -d
```

### Production Environment

**Windows (PowerShell):**
```powershell
.\docker-build-prod.ps1
```

**Linux/Mac:**
```bash
chmod +x docker-build-prod.sh
./docker-build-prod.sh
```

**Manual:**
```bash
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

## Services

The Docker setup includes:

1. **MySQL Database** (port 3306)
   - Database: `oopshop` (default)
   - User: `oopshop_user` (default)
   - Password: Set via `DB_PASSWORD` environment variable

2. **Backend API** (port 5000)
   - Development: Hot reload enabled
   - Production: Optimized build

3. **Frontend Next.js** (port 3000)
   - Development: Hot reload enabled
   - Production: Optimized build

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DB_HOST=mysql
DB_PORT=3306
DB_USER=oopshop_user
DB_PASSWORD=your_secure_password
DB_NAME=oopshop
DB_CONNECTION_LIMIT=10

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Frontend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Useful Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### Stop Containers
```bash
# Development
docker-compose down

# Production
docker-compose -f docker-compose.prod.yml down
```

### Rebuild After Changes
```bash
# Development
docker-compose up -d --build

# Production
docker-compose -f docker-compose.prod.yml up -d --build
```

### Access Container Shell
```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh

# MySQL
docker-compose exec mysql mysql -u root -p
```

### Run Database Migrations
```bash
docker-compose exec backend npm run migrate
```

### Create Admin User
```bash
docker-compose exec backend npm run create-admin
```

## Docker Files Structure

```
├── backend/
│   ├── Dockerfile.dev          # Development Dockerfile
│   ├── Dockerfile.prod         # Production Dockerfile
│   └── .dockerignore           # Files to exclude from build
├── frontend/
│   ├── Dockerfile.dev          # Development Dockerfile
│   ├── Dockerfile.prod         # Production Dockerfile
│   └── .dockerignore           # Files to exclude from build
├── docker-compose.yml          # Development compose file
├── docker-compose.prod.yml     # Production compose file
├── docker-build-dev.ps1        # Windows dev build script
├── docker-build-dev.sh         # Linux/Mac dev build script
├── docker-build-prod.ps1       # Windows prod build script
└── docker-build-prod.sh        # Linux/Mac prod build script
```

## Troubleshooting

### Docker Desktop Not Running
- Make sure Docker Desktop is installed and running
- Check system tray for Docker Desktop icon
- Restart Docker Desktop if needed

### Port Already in Use
- Stop services using ports 3000, 5000, or 3306
- Or change ports in docker-compose.yml

### Database Connection Issues
- Wait for MySQL to be healthy (check with `docker-compose ps`)
- Verify environment variables are correct
- Check logs: `docker-compose logs mysql`

### Build Failures
- Clear Docker cache: `docker system prune -a`
- Rebuild without cache: `docker-compose build --no-cache`

### Permission Issues (Linux/Mac)
- Make scripts executable: `chmod +x *.sh`
- Check file ownership if needed

## Notes

- Development containers use volume mounts for hot reload
- Production containers are optimized and don't include dev dependencies
- Database data persists in Docker volumes
- Logs are stored in Docker volumes for backend

