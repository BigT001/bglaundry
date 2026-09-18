-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "homeAddress" TEXT,
ADD COLUMN     "officeAddress" TEXT;

-- CreateTable
CREATE TABLE "PhoneVerificationToken" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhoneVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PhoneVerificationToken_phone_key" ON "PhoneVerificationToken"("phone");

-- CreateIndex
CREATE INDEX "PhoneVerificationToken_expiresAt_idx" ON "PhoneVerificationToken"("expiresAt");
