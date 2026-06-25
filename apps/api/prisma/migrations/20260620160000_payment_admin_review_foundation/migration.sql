-- CreateEnum
CREATE TYPE "PaymentAdminReviewStatus" AS ENUM ('NONE', 'MANUAL_REVIEW', 'REFUND_DECISION_RECORDED', 'RELEASE_DECISION_RECORDED');

-- CreateEnum
CREATE TYPE "PaymentAdminReviewDecision" AS ENUM ('RECOMMEND_FULL_REFUND', 'RECOMMEND_PARTIAL_REFUND', 'RECOMMEND_RELEASE', 'NO_ACTION', 'OTHER');

-- AlterEnum
ALTER TYPE "AdminAuditLogAction" ADD VALUE 'PAYMENT_MANUAL_REVIEW_MARKED';
ALTER TYPE "AdminAuditLogAction" ADD VALUE 'PAYMENT_MANUAL_REVIEW_CLEARED';
ALTER TYPE "AdminAuditLogAction" ADD VALUE 'PAYMENT_REFUND_DECISION_RECORDED';
ALTER TYPE "AdminAuditLogAction" ADD VALUE 'PAYMENT_RELEASE_DECISION_RECORDED';

-- AlterEnum
ALTER TYPE "AdminAuditLogTargetType" ADD VALUE 'PAYMENT_INTENT';

-- AlterTable
ALTER TABLE "payment_intents" ADD COLUMN "adminReviewStatus" "PaymentAdminReviewStatus" NOT NULL DEFAULT 'NONE';
ALTER TABLE "payment_intents" ADD COLUMN "adminReviewDecision" "PaymentAdminReviewDecision";
ALTER TABLE "payment_intents" ADD COLUMN "adminReviewNote" TEXT;
ALTER TABLE "payment_intents" ADD COLUMN "adminReviewAt" TIMESTAMP(3);
ALTER TABLE "payment_intents" ADD COLUMN "adminReviewByUserId" UUID;

-- CreateIndex
CREATE INDEX "payment_intents_adminReviewStatus_idx" ON "payment_intents"("adminReviewStatus");

-- CreateIndex
CREATE INDEX "payment_intents_adminReviewAt_idx" ON "payment_intents"("adminReviewAt");

-- CreateIndex
CREATE INDEX "payment_intents_adminReviewByUserId_idx" ON "payment_intents"("adminReviewByUserId");

-- AddForeignKey
ALTER TABLE "payment_intents" ADD CONSTRAINT "payment_intents_adminReviewByUserId_fkey" FOREIGN KEY ("adminReviewByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
