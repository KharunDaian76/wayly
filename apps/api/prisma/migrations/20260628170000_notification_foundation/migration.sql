-- Notification foundation v1 — in-app severity types + entity linking.
-- Truncates existing notification rows because enum values are replaced (dev-safe).

TRUNCATE TABLE "notifications";

-- Drop FK and column for legacy order link
ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "notifications_relatedOrderId_fkey";
DROP INDEX IF EXISTS "notifications_relatedOrderId_idx";
ALTER TABLE "notifications" DROP COLUMN IF EXISTS "relatedOrderId";

-- Replace NotificationType enum
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ACTION_REQUIRED');
ALTER TABLE "notifications"
  ALTER COLUMN "type" TYPE "NotificationType"
  USING 'INFO'::"NotificationType";
DROP TYPE "NotificationType_old";

-- Entity linking + required body + timestamps
CREATE TYPE "NotificationEntityType" AS ENUM (
  'SUPPORT_TICKET',
  'DELIVERY_ORDER',
  'WAYLER_AVAILABILITY_REQUEST',
  'PAYMENT',
  'DISPUTE',
  'SYSTEM'
);

ALTER TABLE "notifications" ADD COLUMN "linkHref" TEXT;
ALTER TABLE "notifications" ADD COLUMN "entityType" "NotificationEntityType";
ALTER TABLE "notifications" ADD COLUMN "entityId" UUID;
ALTER TABLE "notifications" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "notifications" SET "body" = '' WHERE "body" IS NULL;
ALTER TABLE "notifications" ALTER COLUMN "body" SET NOT NULL;

-- Index refresh
DROP INDEX IF EXISTS "notifications_readAt_idx";
CREATE INDEX "notifications_userId_readAt_idx" ON "notifications"("userId", "readAt");
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");
CREATE INDEX "notifications_entityType_entityId_idx" ON "notifications"("entityType", "entityId");
