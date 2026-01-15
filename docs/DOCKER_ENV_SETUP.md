# Docker Environment Setup Guide

## Quick Start with Remote Database

1. **Create `.env` file** in the project root:

```env
# Remote Database Configuration
DB_HOST=your-remote-database-host.com
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

# Skip migrations (remote DB already has schema)
SKIP_MIGRATIONS=true

# Backend Configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=24h
```

2. **Start containers**:

```bash
docker compose up
```

The backend will automatically connect to your remote database!

## How It Works

- **Remote Database**: Set `DB_HOST` in `.env` → Backend connects to remote DB, MySQL container won't start
- **Local Database**: Don't set `DB_HOST` (or set to `mysql`) → Start with `docker compose --profile local-db up`

## Configuration Options

### Using Remote Database (Your Case)

Create `.env` file:
```env
DB_HOST=your-remote-database-host.com
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
SKIP_MIGRATIONS=true
```

Then run:
```bash
docker compose up
```

### Using Local Database

Option 1: Don't set `DB_HOST` in `.env`, then:
```bash
docker compose --profile local-db up
```

Option 2: Set `DB_HOST=mysql` in `.env`, then:
```bash
docker compose --profile local-db up
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | Database host (remote server or 'mysql' for local) | `mysql` | Yes |
| `DB_PORT` | Database port | `3306` | No |
| `DB_USER` | Database username | - | Yes |
| `DB_PASSWORD` | Database password | - | Yes |
| `DB_NAME` | Database name | `oopshop` | No |
| `SKIP_MIGRATIONS` | Skip running migrations (for remote DB with existing schema) | `false` | No |
| `JWT_SECRET` | Secret key for JWT tokens | - | Yes |
| `JWT_EXPIRES_IN` | JWT token expiration | `24h` | No |

## Troubleshooting

### Backend Can't Connect to Remote Database

1. **Check `.env` file exists** in project root
2. **Verify credentials** are correct
3. **Test connection** from your machine:
   ```bash
   mysql -h your-remote-host -u your_user -p
   ```
4. **Check firewall** allows connections from your IP
5. **Verify database user** has remote access permissions

### MySQL Container Still Starting

If you see MySQL container starting when using remote DB:
- Make sure `DB_HOST` is set in `.env` to your remote host (not 'mysql')
- The MySQL service uses a profile, so it won't start unless you use `--profile local-db`

### Connection Timeout

If backend times out waiting for database:
- Check if remote database is accessible
- Verify `DB_HOST` is correct (use IP or domain name)
- For databases on same machine, try `host.docker.internal` as `DB_HOST`

## Examples

### Remote Database on Different Server
```env
DB_HOST=db.example.com
DB_PORT=3306
DB_USER=oopshop_user
DB_PASSWORD=secure_password
DB_NAME=oopshop
SKIP_MIGRATIONS=true
```

### Remote Database on Same Machine
```env
DB_HOST=host.docker.internal
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=oopshop
SKIP_MIGRATIONS=true
```

### Local Database (Docker Container)
```env
# Don't set DB_HOST, or set to:
DB_HOST=mysql
DB_USER=oopshop_user
DB_PASSWORD=oopshop_password
DB_NAME=oopshop
SKIP_MIGRATIONS=false
```

Then run: `docker compose --profile local-db up`

