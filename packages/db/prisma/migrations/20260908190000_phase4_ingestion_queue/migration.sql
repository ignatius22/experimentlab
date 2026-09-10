CREATE TABLE "EventIngestionBatch" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "eventCount" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'reserved',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),
  CONSTRAINT "EventIngestionBatch_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EventIngestionBatch_organizationId_status_idx"
ON "EventIngestionBatch"("organizationId", "status");

ALTER TABLE "EventIngestionBatch"
ADD CONSTRAINT "EventIngestionBatch_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
