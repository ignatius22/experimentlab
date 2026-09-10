#!/bin/sh
set -e
if [ "${PROCESS_ROLE:-web}" = "worker" ]; then
  echo "[ExperimentLab] Starting event ingestion worker..."
  exec node apps/web/event-worker.cjs
fi
echo "[ExperimentLab] Starting Next.js Web Server on port 3000..."
exec node apps/web/server.js
