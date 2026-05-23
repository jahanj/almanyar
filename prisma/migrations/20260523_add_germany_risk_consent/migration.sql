-- TRUST-10 — explicit acknowledgement that German-side outcomes
-- (embassy, university, test-center decisions) are out of Almanyar's
-- control. Nullable columns so historical rows stay valid; API
-- routes reject new submissions without `germanyRiskAcknowledged = true`.

ALTER TABLE "Evaluation"
  ADD COLUMN "germanyRiskAcknowledged"   BOOLEAN,
  ADD COLUMN "germanyRiskAcknowledgedAt" TIMESTAMP(3);

ALTER TABLE "ContactRequest"
  ADD COLUMN "germanyRiskAcknowledged"   BOOLEAN,
  ADD COLUMN "germanyRiskAcknowledgedAt" TIMESTAMP(3);
