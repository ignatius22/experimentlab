-- A queued batch is grouped by the month in which it was accepted. This is
-- required by the asynchronous ingestion path and is safe to apply to both
-- existing hosted databases and fresh Community Edition installations.
ALTER TABLE "EventIngestionBatch"
ADD COLUMN IF NOT EXISTS "billingPeriod" TIMESTAMP(3);

UPDATE "EventIngestionBatch"
SET "billingPeriod" = date_trunc('month', "createdAt" AT TIME ZONE 'UTC')
WHERE "billingPeriod" IS NULL;

ALTER TABLE "EventIngestionBatch"
ALTER COLUMN "billingPeriod" SET NOT NULL;
