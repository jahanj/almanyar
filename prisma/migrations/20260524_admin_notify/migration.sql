-- Phase-4 §4 — Admin notify-customer feature.
-- Additive only: nullable column per lead table + new audit log table +
-- new enum. Rollback = drop columns + drop table + drop enum.

ALTER TABLE "ContactRequest" ADD COLUMN "lastNotifiedAt" TIMESTAMP(3);
ALTER TABLE "Evaluation"     ADD COLUMN "lastNotifiedAt" TIMESTAMP(3);
ALTER TABLE "Application"    ADD COLUMN "lastNotifiedAt" TIMESTAMP(3);

CREATE TYPE "AdminEmailLeadType" AS ENUM ('CONTACT', 'EVALUATION', 'APPLICATION');

CREATE TABLE "AdminEmailLog" (
    "id"        TEXT NOT NULL,
    "leadType"  "AdminEmailLeadType" NOT NULL,
    "leadId"    TEXT NOT NULL,
    "to"        TEXT NOT NULL,
    "subject"   TEXT NOT NULL,
    "snippet"   TEXT NOT NULL,
    "sentBy"    TEXT,
    "sentAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminEmailLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AdminEmailLog_leadType_leadId_idx" ON "AdminEmailLog" ("leadType", "leadId");
CREATE INDEX "AdminEmailLog_sentAt_idx"          ON "AdminEmailLog" ("sentAt");
