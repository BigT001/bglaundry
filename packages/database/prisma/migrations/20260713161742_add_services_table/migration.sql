-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "hasIroning" BOOLEAN NOT NULL DEFAULT true,
    "hasDryCleaning" BOOLEAN NOT NULL DEFAULT true,
    "ironPrice" DOUBLE PRECISION NOT NULL,
    "dryCleanPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);
