-- TRUST-05 — seed the SiteStats singleton with the owner's verified
-- in-Turkey numbers. Only populates columns that are still NULL, so if
-- the owner has already used /admin/stats to set anything, this no-ops
-- on those columns.
--
-- Two values today: studentsCount = 20, yearsExperience = 6. Partner
-- universities, success rate, and reviews/rating remain NULL → the
-- frontend continues to hide them (Phase-1 BUG-03 hide rule).
--
-- Idempotent: re-running this migration is harmless. The Phase-1 init
-- migration inserted the (id=1, all-NULL) row, so this UPDATE always
-- matches exactly one row.

UPDATE "SiteStats"
SET
  "studentsCount"   = COALESCE("studentsCount",   20),
  "yearsExperience" = COALESCE("yearsExperience", 6)
WHERE "id" = 1;
