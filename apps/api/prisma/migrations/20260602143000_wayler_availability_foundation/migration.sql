-- CreateEnum
CREATE TYPE "WaylerAvailabilityStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WaylerAvailabilityType" AS ENUM ('LOCAL_AVAILABILITY', 'TRIP_ROUTE');

-- CreateEnum
CREATE TYPE "TripDirection" AS ENUM ('ONE_WAY', 'RETURN', 'FLEXIBLE');

-- CreateTable
CREATE TABLE "wayler_availabilities" (
    "id" UUID NOT NULL,
    "waylerId" UUID NOT NULL,
    "type" "WaylerAvailabilityType" NOT NULL,
    "status" "WaylerAvailabilityStatus" NOT NULL DEFAULT 'DRAFT',
    "originCountry" TEXT,
    "originCity" TEXT,
    "originRegion" TEXT,
    "destinationCountry" TEXT,
    "destinationCity" TEXT,
    "destinationRegion" TEXT,
    "availableFrom" TIMESTAMP(3) NOT NULL,
    "availableTo" TIMESTAMP(3),
    "departureDate" TIMESTAMP(3),
    "returnDate" TIMESTAMP(3),
    "tripDirection" "TripDirection",
    "maxPackages" INTEGER,
    "maxWeightKg" DECIMAL(8,2),
    "notes" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "pausedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wayler_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wayler_availabilities_waylerId_idx" ON "wayler_availabilities"("waylerId");

-- CreateIndex
CREATE INDEX "wayler_availabilities_type_idx" ON "wayler_availabilities"("type");

-- CreateIndex
CREATE INDEX "wayler_availabilities_status_idx" ON "wayler_availabilities"("status");

-- CreateIndex
CREATE INDEX "wayler_availabilities_isPublic_idx" ON "wayler_availabilities"("isPublic");

-- CreateIndex
CREATE INDEX "wayler_availabilities_originCountry_idx" ON "wayler_availabilities"("originCountry");

-- CreateIndex
CREATE INDEX "wayler_availabilities_originCity_idx" ON "wayler_availabilities"("originCity");

-- CreateIndex
CREATE INDEX "wayler_availabilities_originRegion_idx" ON "wayler_availabilities"("originRegion");

-- CreateIndex
CREATE INDEX "wayler_availabilities_destinationCountry_idx" ON "wayler_availabilities"("destinationCountry");

-- CreateIndex
CREATE INDEX "wayler_availabilities_destinationCity_idx" ON "wayler_availabilities"("destinationCity");

-- CreateIndex
CREATE INDEX "wayler_availabilities_destinationRegion_idx" ON "wayler_availabilities"("destinationRegion");

-- CreateIndex
CREATE INDEX "wayler_availabilities_availableFrom_idx" ON "wayler_availabilities"("availableFrom");

-- CreateIndex
CREATE INDEX "wayler_availabilities_availableTo_idx" ON "wayler_availabilities"("availableTo");

-- CreateIndex
CREATE INDEX "wayler_availabilities_departureDate_idx" ON "wayler_availabilities"("departureDate");

-- CreateIndex
CREATE INDEX "wayler_availabilities_expiresAt_idx" ON "wayler_availabilities"("expiresAt");

-- CreateIndex
CREATE INDEX "wayler_availabilities_createdAt_idx" ON "wayler_availabilities"("createdAt");

-- AddForeignKey
ALTER TABLE "wayler_availabilities" ADD CONSTRAINT "wayler_availabilities_waylerId_fkey" FOREIGN KEY ("waylerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
