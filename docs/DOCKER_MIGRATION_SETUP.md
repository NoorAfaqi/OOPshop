# Docker Migration Setup

## Problem
When running `docker compose up`, the database tables don't exist, causing errors like:
```
error: Table 'oopshop.products' doesn't exist
```

## Solution
An entrypoint script has been added that automatically runs database migrations before starting the server.

## How It Works

1. **Entrypoint Script** (`backend/docker-entrypoint.sh`):
   - Waits for the database to be ready
   - Runs database migrations automatically
   - Starts the server

2. **Dockerfiles Updated**:
   - `backend/Dockerfile.dev` - Development with migrations
   - `backend/Dockerfile.prod` - Production with migrations

## Usage

### First Time Setup

1. **Rebuild containers** (to include the new entrypoint script):
   ```bash
   docker compose down
   docker compose build --no-cache backend
   docker compose up
   ```

2. **Or rebuild everything**:
   ```bash
   docker compose down
   docker compose build
   docker compose up
   ```

### Normal Usage

After the first setup, migrations will run automatically every time you start the containers:

```bash
docker compose up
```

The backend will:
1. Wait for MySQL to be ready
2. Run migrations automatically
3. Start the server

## Manual Migration (if needed)

If you need to run migrations manually:

```bash
# Development
docker compose exec backend npm run migrate

# Production
docker compose -f docker-compose.prod.yml exec backend npm run migrate
```

## Troubleshooting

### Migrations Not Running

1. **Check if entrypoint script exists**:
   ```bash
   docker compose exec backend ls -la /usr/local/bin/docker-entrypoint.sh
   ```

2. **Check container logs**:
   ```bash
   docker compose logs backend | grep -i migration
   ```

3. **Run migrations manually**:
   ```bash
   docker compose exec backend node src/migrate.js
   ```

### Database Connection Issues

1. **Check if MySQL is ready**:
   ```bash
   docker compose exec mysql mysqladmin ping -h localhost -u root -p
   ```

2. **Check environment variables**:
   ```bash
   docker compose exec backend env | grep DB_
   ```

### Rebuild After Changes

If you modify the entrypoint script or Dockerfiles:

```bash
docker compose down
docker compose build backend
docker compose up
```

## What Gets Created

The migrations create the following tables:
- `users` - Unified user table (admin, manager, customer, guest)
- `products` - Product catalog
- `invoices` - Order/invoice management
- `payments` - Payment records
- `stock_history` - Inventory tracking
- And more...

## Notes

- Migrations are **idempotent** - safe to run multiple times
- Uses `CREATE TABLE IF NOT EXISTS` - won't fail if tables already exist
- The entrypoint script waits up to 60 seconds for the database
- If migrations fail, the server will still start (check logs for errors)

