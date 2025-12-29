# Remote Database Setup Guide

## Problem
Your Docker containers are connecting to a local MySQL container, but you want to use a remote database server that already has data.

## Solution

You have two options:

### Option 1: Use Remote Database Compose File (Recommended)

1. **Create/Update `.env` file** in the project root with your remote database credentials:

```env
# Remote Database Configuration
DB_HOST=your-remote-database-host.com
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

# Backend Configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=24h

# Skip migrations (remote DB already has schema)
SKIP_MIGRATIONS=true
```

2. **Use the remote database compose file**:

```bash
docker compose -f docker-compose.remote-db.yml up
```

This compose file:
- ✅ Doesn't start a local MySQL container
- ✅ Connects directly to your remote database
- ✅ Skips migrations (since your remote DB already has schema)
- ✅ Still runs backend and frontend containers

### Option 2: Modify Default Compose File

1. **Update `.env` file** with remote database credentials:

```env
DB_HOST=your-remote-database-host.com
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
SKIP_MIGRATIONS=true
```

2. **Comment out the MySQL service** in `docker-compose.yml`:

```yaml
services:
  # MySQL Database - COMMENTED OUT (using remote database)
  # mysql:
  #   image: mysql:8.0
  #   ...
```

3. **Remove the `depends_on` from backend**:

```yaml
backend:
  # ...
  # depends_on:
  #   mysql:
  #     condition: service_healthy
```

4. **Start containers**:

```bash
docker compose up
```

## Environment Variables

Create a `.env` file in the project root with:

```env
# Remote Database (Required)
DB_HOST=your-remote-database-host.com
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

# Optional
DB_CONNECTION_LIMIT=10
SKIP_MIGRATIONS=true  # Set to true if remote DB already has schema
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
```

## Important Notes

### Network Access
- Make sure your Docker container can reach the remote database
- If the database is on the same machine, use `host.docker.internal` as DB_HOST
- If the database is on a different server, ensure:
  - The remote database allows connections from your Docker host IP
  - Firewall rules allow MySQL port (3306)
  - The database user has remote access permissions

### Security
- **Never commit `.env` file to git** - it contains sensitive credentials
- Use strong passwords for database access
- Consider using environment-specific `.env` files (`.env.local`, `.env.production`)

### Migrations
- Set `SKIP_MIGRATIONS=true` if your remote database already has the schema
- If you need to run migrations on remote DB, set `SKIP_MIGRATIONS=false`
- Migrations are idempotent (safe to run multiple times)

## Troubleshooting

### Connection Refused
```
Error: connect ECONNREFUSED
```

**Solutions:**
1. Check if `DB_HOST` is correct
2. Verify the remote database is accessible from your machine
3. Check firewall rules
4. Verify database user has remote access permissions

### Access Denied
```
Error: Access denied for user
```

**Solutions:**
1. Verify `DB_USER` and `DB_PASSWORD` are correct
2. Check if the user has access to the specified database
3. Verify the user has remote access permissions

### Can't Connect to Remote Database
If your remote database is on the same machine but not accessible:

1. **Use host.docker.internal** (for Docker Desktop):
   ```env
   DB_HOST=host.docker.internal
   ```

2. **Use host network mode** (Linux only):
   ```yaml
   backend:
     network_mode: host
   ```

3. **Use the host's IP address**:
   ```env
   DB_HOST=192.168.1.100  # Your machine's IP
   ```

## Quick Start

1. **Create `.env` file** with remote database credentials
2. **Run with remote database**:
   ```bash
   docker compose -f docker-compose.remote-db.yml up --build
   ```

3. **Verify connection**:
   - Check backend logs: `docker compose logs backend`
   - Look for: `✅ Database is ready!`
   - Test API: `curl http://localhost:5000/health`

## Switching Between Local and Remote

- **Local database**: `docker compose up` (uses local MySQL container)
- **Remote database**: `docker compose -f docker-compose.remote-db.yml up` (connects to remote)

