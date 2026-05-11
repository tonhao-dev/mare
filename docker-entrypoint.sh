#!/bin/sh
set -e

# Run Prisma migrations before starting the server.
# The DATABASE_URL must point to the persistent volume, e.g.:
#   DATABASE_URL=file:/data/prod.db
echo "Running database migrations..."
node_modules/.bin/prisma migrate deploy \
  --schema=packages/database/prisma/schema.prisma

echo "Starting Next.js server..."
exec node apps/web/server.js
