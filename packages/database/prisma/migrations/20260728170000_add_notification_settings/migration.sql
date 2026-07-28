CREATE TABLE "NotificationSettings" (
  "id" TEXT NOT NULL DEFAULT 'default',
  "adminEmails" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "NotificationSettings_pkey" PRIMARY KEY ("id")
);
