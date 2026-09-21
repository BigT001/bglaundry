-- Additive only: does not alter or delete customer, order or payment data.
CREATE TABLE "MobileReport" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'MOBILE',
  "kind" TEXT NOT NULL,
  "platform" TEXT NOT NULL,
  "appVersion" TEXT NOT NULL,
  "osVersion" TEXT,
  "errorName" TEXT,
  "stack" TEXT,
  "endpoint" TEXT,
  "httpStatus" INTEGER,
  "durationMs" INTEGER,
  "fingerprint" TEXT NOT NULL,
  "rateKey" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "occurredAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MobileReport_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MobileReport_eventId_key" ON "MobileReport"("eventId");
CREATE INDEX "MobileReport_createdAt_idx" ON "MobileReport"("createdAt");
CREATE INDEX "MobileReport_status_createdAt_idx" ON "MobileReport"("status", "createdAt");
CREATE INDEX "MobileReport_fingerprint_idx" ON "MobileReport"("fingerprint");
CREATE INDEX "MobileReport_rateKey_createdAt_idx" ON "MobileReport"("rateKey", "createdAt");
