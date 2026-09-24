-- Compound unique constraints for safe multi-tenant updates
CREATE UNIQUE INDEX IF NOT EXISTS "Experiment_id_organizationId_key" ON "Experiment"("id", "organizationId");
CREATE UNIQUE INDEX IF NOT EXISTS "FeatureFlag_id_organizationId_key" ON "FeatureFlag"("id", "organizationId");

-- High-performance composite indexes on Event table for analytics and results queries
CREATE INDEX IF NOT EXISTS "Event_organizationId_type_name_idx" ON "Event"("organizationId", "type", "name");
CREATE INDEX IF NOT EXISTS "Event_organizationId_createdAt_idx" ON "Event"("organizationId", "createdAt");
CREATE INDEX IF NOT EXISTS "Event_organizationId_userId_idx" ON "Event"("organizationId", "userId");
