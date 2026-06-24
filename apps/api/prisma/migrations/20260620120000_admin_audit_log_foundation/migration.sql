-- CreateEnum
CREATE TYPE "AdminAuditLogAction" AS ENUM ('KYC_APPROVED', 'KYC_REJECTED', 'DISPUTE_RESOLVED');

-- CreateEnum
CREATE TYPE "AdminAuditLogTargetType" AS ENUM ('KYC_VERIFICATION', 'DISPUTE');

-- CreateEnum
CREATE TYPE "AdminAuditLogStatus" AS ENUM ('SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "admin_audit_logs" (
    "id" UUID NOT NULL,
    "actorUserId" UUID NOT NULL,
    "actorEmailSnapshot" TEXT NOT NULL,
    "actorDisplaySnapshot" TEXT NOT NULL,
    "actorRolesSnapshot" "UserRole"[],
    "action" "AdminAuditLogAction" NOT NULL,
    "targetType" "AdminAuditLogTargetType" NOT NULL,
    "targetId" UUID NOT NULL,
    "targetUserId" UUID,
    "status" "AdminAuditLogStatus" NOT NULL DEFAULT 'SUCCESS',
    "summary" TEXT NOT NULL,
    "metadata" JSONB,
    "requestId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_audit_logs_createdAt_idx" ON "admin_audit_logs"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "admin_audit_logs_action_idx" ON "admin_audit_logs"("action");

-- CreateIndex
CREATE INDEX "admin_audit_logs_actorUserId_idx" ON "admin_audit_logs"("actorUserId");

-- CreateIndex
CREATE INDEX "admin_audit_logs_targetType_targetId_idx" ON "admin_audit_logs"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "admin_audit_logs_targetUserId_idx" ON "admin_audit_logs"("targetUserId");

-- AddForeignKey
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
