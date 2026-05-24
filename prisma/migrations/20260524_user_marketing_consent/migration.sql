-- Phase-4 §5 — marketing email opt-in on User.
-- Additive only; default FALSE so historical users are opt-OUT until
-- they explicitly toggle the registration checkbox (GDPR-safe).

ALTER TABLE "User"
  ADD COLUMN "marketingConsent"   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "marketingConsentAt" TIMESTAMP(3);
