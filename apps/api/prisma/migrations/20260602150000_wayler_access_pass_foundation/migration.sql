-- CreateEnum
CREATE TYPE "WaylerAccessPassStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'REFUNDED', 'FAILED');

-- CreateEnum
CREATE TYPE "WaylerAccessPassProvider" AS ENUM ('MANUAL', 'STRIPE', 'OTHER');

-- CreateTable
CREATE TABLE "wayler_access_passes" (
    "id" UUID NOT NULL,
    "waylerId" UUID NOT NULL,
    "status" "WaylerAccessPassStatus" NOT NULL DEFAULT 'PENDING',
    "provider" "WaylerAccessPassProvider" NOT NULL DEFAULT 'MANUAL',
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "amount" DECIMAL(12,2) NOT NULL DEFAULT 1.00,
    "providerPaymentId" TEXT,
    "accessDate" TIMESTAMP(3) NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "activatedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wayler_access_passes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wayler_access_passes_waylerId_idx" ON "wayler_access_passes"("waylerId");

-- CreateIndex
CREATE INDEX "wayler_access_passes_status_idx" ON "wayler_access_passes"("status");

-- CreateIndex
CREATE INDEX "wayler_access_passes_provider_idx" ON "wayler_access_passes"("provider");

-- CreateIndex
CREATE INDEX "wayler_access_passes_accessDate_idx" ON "wayler_access_passes"("accessDate");

-- CreateIndex
CREATE INDEX "wayler_access_passes_startsAt_idx" ON "wayler_access_passes"("startsAt");

-- CreateIndex
CREATE INDEX "wayler_access_passes_expiresAt_idx" ON "wayler_access_passes"("expiresAt");

-- CreateIndex
CREATE INDEX "wayler_access_passes_createdAt_idx" ON "wayler_access_passes"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "wayler_access_passes_waylerId_accessDate_key" ON "wayler_access_passes"("waylerId", "accessDate");

-- AddForeignKey
ALTER TABLE "wayler_access_passes" ADD CONSTRAINT "wayler_access_passes_waylerId_fkey" FOREIGN KEY ("waylerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
