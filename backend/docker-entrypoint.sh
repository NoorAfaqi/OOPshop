#!/bin/sh
set -e

echo "🔵 Starting backend container..."

# Check if we should skip migrations (for remote databases that already have schema)
if [ "$SKIP_MIGRATIONS" = "true" ]; then
  echo "⏭️  Skipping migrations (SKIP_MIGRATIONS=true)"
else
  # Wait for database to be ready
  echo "⏳ Waiting for database to be ready..."
  max_attempts=30
  attempt=0

  while [ $attempt -lt $max_attempts ]; do
    if node -e "
      const mysql = require('mysql2/promise');
      (async () => {
        try {
          const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'mysql',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'oopshop',
          });
          await connection.ping();
          await connection.end();
          process.exit(0);
        } catch (err) {
          process.exit(1);
        }
      })();
    " 2>/dev/null; then
      echo "✅ Database is ready!"
      break
    fi
    
    attempt=$((attempt + 1))
    if [ $attempt -lt $max_attempts ]; then
      echo "   Attempt $attempt/$max_attempts - waiting 2 seconds..."
      sleep 2
    fi
  done

  if [ $attempt -eq $max_attempts ]; then
    echo "⚠️  Database connection timeout, but continuing anyway..."
  fi

  # Run migrations
  echo "🔄 Running database migrations..."
  node src/migrate.js || echo "⚠️  Migration had errors, but continuing..."
fi

# Start the server
echo "🚀 Starting server..."
exec "$@"

