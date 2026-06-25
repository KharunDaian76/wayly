-- CreateEnum
CREATE TYPE "OrderAdminReviewStatus" AS ENUM ('NONE', 'MANUAL_REVIEW', 'DECISION_RECORDED', 'RISK_FLAGGED');

-- CreateEnum
CREATE TYPE "OrderAdminReviewDecision" AS ENUM ('MONITOR', 'ESCALATE_PAYMENT', 'ESCALATE_DISPUTE', 'NO_ACTION', 'OTHER');

-- AlterEnum
ALTER TYPE "AdminAuditLogAction" ADD VALUE 'ORDER_MANUAL_REVIEW_MARKED';
ALTER TYPE "AdminAuditLogAction" ADD VALUE 'ORDER_MANUAL_REVIEW_CLEARED';
ALTER TYPE "AdminAuditLogAction" ADD VALUE 'ORDER_DECISION_RECORDED';
ALTER TYPE "AdminAuditLogAction" ADD VALUE 'ORDER_RISK_FLAGGED';
ALTER TYPE "AdminAuditLogAction" ADD VALUE 'ORDER_RISK_CLEARED';

-- AlterEnum
ALTER TYPE "AdminAuditLogTargetType" ADD VALUE 'DELIVERY_ORDER';

-- AlterTable
ALTER TABLE "delivery_orders" ADD COLUMN "adminReviewStatus" "OrderAdminReviewStatus" NOT NULL DEFAULT 'NONE';
ALTER TABLE "delivery_orders" ADD COLUMN "adminReviewDecision" "OrderAdminReviewDecision";
ALTER TABLE "delivery_orders" ADD COLUMN "adminReviewNote" TEXT;
ALTER TABLE "delivery_orders" ADD COLUMN "adminReviewAt" TIMESTAMP(3);
ALTER TABLE "delivery_orders" ADD COLUMN "adminReviewByUserId" UUID;

-- CreateIndex
CREATE INDEX "delivery_orders_adminReviewStatus_idx" ON "delivery_orders"("adminReviewStatus");

-- CreateIndex
CREATE INDEX "delivery_orders_adminReviewAt_idx" ON "delivery_orders"("adminReviewAt");

-- CreateIndex
CREATE INDEX "delivery_orders_adminReviewByUserId_idx" ON "delivery_orders"("adminReviewByUserId");

-- AddForeignKey
ALTER TABLE "delivery_orders" ADD CONSTRAINT "delivery_orders_adminReviewByUserId_fkey" FOREIGN KEY ("adminReviewByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
