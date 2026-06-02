-- CreateTable
CREATE TABLE "kyc_verifications" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "status" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT,
    "providerApplicantId" TEXT,
    "providerReviewId" TEXT,
    "levelName" TEXT,
    "country" TEXT,
    "documentType" TEXT,
    "rejectionReason" TEXT,
    "rawProviderPayload" JSONB,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kyc_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kyc_verifications_providerApplicantId_key" ON "kyc_verifications"("providerApplicantId");

-- CreateIndex
CREATE INDEX "kyc_verifications_userId_idx" ON "kyc_verifications"("userId");

-- CreateIndex
CREATE INDEX "kyc_verifications_status_idx" ON "kyc_verifications"("status");

-- CreateIndex
CREATE INDEX "kyc_verifications_createdAt_idx" ON "kyc_verifications"("createdAt");

-- AddForeignKey
ALTER TABLE "kyc_verifications" ADD CONSTRAINT "kyc_verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
