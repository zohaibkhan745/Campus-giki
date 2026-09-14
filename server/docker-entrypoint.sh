#!/bin/sh
set -e

echo "=== [Campus GIKI Server] Starting Entrypoint ==="

# Wait for PostgreSQL to accept connections through Prisma
echo "Applying Prisma database migrations..."
npx prisma migrate deploy

# Optionally seed the database on initial run
if [ "$AUTO_SEED" = "true" ]; then
  echo "Auto-seeding database requested (AUTO_SEED=true)..."
  npm run seed || echo "Seed command completed with notice (continuing)..."
fi

echo "=== [Campus GIKI Server] Launching application ==="
exec "$@"
