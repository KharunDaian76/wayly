-- CreateEnum
CREATE TYPE "UserAccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- AlterEnum
ALTER TYPE "AdminAuditLogAction" ADD VALUE 'USER_SUSPENDED';
ALTER TYPE "AdminAuditLogAction" ADD VALUE 'USER_UNSUSPENDED';

-- AlterEnum
ALTER TYPE "AdminAuditLogTargetType" ADD VALUE 'USER';

-- AlterTable
ALTER TABLE "users" ADD COLUMN "accountStatus" "UserAccountStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "users" ADD COLUMN "suspendedAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "suspensionReason" TEXT;

-- CreateIndex
CREATE INDEX "users_accountStatus_idx" ON "users"("accountStatus");

-- CreateIndex
CREATE INDEX "users_suspendedAt_idx" ON "users"("suspendedAt");
