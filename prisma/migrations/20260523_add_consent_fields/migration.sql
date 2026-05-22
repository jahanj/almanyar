-- LEGAL-04 — consent capture fields. Additive, all nullable. Rollback is
-- straightforward: ALTER TABLE … DROP COLUMN …; no data depends on these.

ALTER TABLE "ContactRequest"
  ADD COLUMN "consentAcceptedAt"   TIMESTAMP(3),
  ADD COLUMN "consentTermsVersion" INTEGER,
  ADD COLUMN "consentIp"           TEXT,
  ADD COLUMN "consentUserAgent"    TEXT,
  ADD COLUMN "marketingConsent"    BOOLEAN;

ALTER TABLE "Evaluation"
  ADD COLUMN "consentAcceptedAt"   TIMESTAMP(3),
  ADD COLUMN "consentTermsVersion" INTEGER,
  ADD COLUMN "consentIp"           TEXT,
  ADD COLUMN "consentUserAgent"    TEXT,
  ADD COLUMN "marketingConsent"    BOOLEAN;
