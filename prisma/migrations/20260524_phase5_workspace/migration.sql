-- Phase-5 §workspace — co-managed student panel schema.
-- Additive only; rollback = drop the two tables + the new column +
-- the two enums.

-- ───── New enums ─────
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE', 'BLOCKED');

CREATE TYPE "TaskCategory" AS ENUM (
  'UNIVERSITY_REGISTRATION',
  'RESIDENCE_PERMIT',
  'HEALTH_INSURANCE',
  'BANK_ACCOUNT',
  'SPERRKONTO',
  'MONEY_TRANSFER',
  'DOCUMENT_TRANSLATION',
  'EMBASSY_APPOINTMENT',
  'OTHER'
);

-- ───── User: daily-digest opt-in (defaults false; respects GDPR opt-out) ─────
ALTER TABLE "User"
  ADD COLUMN "notificationDailyDigest" BOOLEAN NOT NULL DEFAULT false;

-- ───── Task model ─────
CREATE TABLE "Task" (
  "id"                  TEXT NOT NULL,
  "applicationId"       TEXT NOT NULL,
  "order"               INTEGER NOT NULL,
  "title"               TEXT NOT NULL,
  "description"         TEXT,
  "category"            "TaskCategory" NOT NULL DEFAULT 'OTHER',
  "status"              "TaskStatus" NOT NULL DEFAULT 'PENDING',
  "requiredDocCategory" "DocumentCategory",
  "studentTicked"       BOOLEAN NOT NULL DEFAULT false,
  "studentTickedAt"     TIMESTAMP(3),
  "studentTickedById"   TEXT,
  "adminTicked"         BOOLEAN NOT NULL DEFAULT false,
  "adminTickedAt"       TIMESTAMP(3),
  "adminTickedById"     TEXT,
  "dueDate"             TIMESTAMP(3),
  "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Task_applicationId_order_idx" ON "Task" ("applicationId", "order");
CREATE INDEX "Task_status_idx"              ON "Task" ("status");

ALTER TABLE "Task"
  ADD CONSTRAINT "Task_applicationId_fkey"
    FOREIGN KEY ("applicationId") REFERENCES "Application"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Task"
  ADD CONSTRAINT "Task_studentTickedById_fkey"
    FOREIGN KEY ("studentTickedById") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Task"
  ADD CONSTRAINT "Task_adminTickedById_fkey"
    FOREIGN KEY ("adminTickedById") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- ───── EmailRateLimit ledger ─────
CREATE TABLE "EmailRateLimit" (
  "id"     TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "kind"   TEXT NOT NULL,
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailRateLimit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmailRateLimit_userId_kind_sentAt_idx"
  ON "EmailRateLimit" ("userId", "kind", "sentAt");
