#!/bin/sh
set -e
if [ "${PROCESS_ROLE:-web}" = "worker" ]; then
  echo "[ExperimentLab] Starting event ingestion worker..."
  exec node apps/web/event-worker.cjs
fi

echo "[ExperimentLab] Applying database migrations..."
if command -v npx > /dev/null 2>&1; then
  npx prisma migrate deploy --schema=packages/db/prisma/schema.prisma || echo "[ExperimentLab] Warning: prisma migrate deploy exited with non-zero status"
fi

echo "[ExperimentLab] Starting Next.js Web Server on port 3000..."
exec node apps/web/server.js
