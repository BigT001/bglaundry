/*
  Warnings:

  - You are about to drop the column `dryCleanPrice` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `hasDryCleaning` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `hasIroning` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Service" DROP COLUMN "dryCleanPrice",
DROP COLUMN "hasDryCleaning",
DROP COLUMN "hasIroning",
ADD COLUMN     "hasIron" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "hasWash" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "hasWashIron" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "washIronPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "washPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "ironPrice" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "addressType" TEXT,
ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "pickupAddress" TEXT;
