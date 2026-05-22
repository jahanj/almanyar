-- CreateTable
CREATE TABLE "SiteStats" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "studentsCount" INTEGER,
    "partnerUniversities" INTEGER,
    "successRate" INTEGER,
    "yearsExperience" INTEGER,
    "averageRating" DOUBLE PRECISION,
    "reviewsCount" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SiteStats_pkey" PRIMARY KEY ("id")
);

-- Seed: a single all-NULL row so frontend always reads the same singleton id=1.
INSERT INTO "SiteStats" ("id", "updatedAt") VALUES (1, CURRENT_TIMESTAMP)
  ON CONFLICT ("id") DO NOTHING;
