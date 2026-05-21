-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('NEW', 'REVIEWING', 'CONTACTED', 'CLOSED');

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "status" "EvaluationStatus" NOT NULL DEFAULT 'NEW',
    "fullName" TEXT NOT NULL,
    "gender" TEXT,
    "maritalStatus" TEXT,
    "birthDate" TEXT,
    "militaryStatus" TEXT,
    "hasChildUnder18" BOOLEAN NOT NULL DEFAULT false,
    "mobile" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "province" TEXT,
    "germanLevel" TEXT,
    "hasIelts" BOOLEAN NOT NULL DEFAULT false,
    "ieltsScore" TEXT,
    "hasToefl" BOOLEAN NOT NULL DEFAULT false,
    "toeflScore" TEXT,
    "diplomaField" TEXT,
    "diplomaGpa" TEXT,
    "lastDegree" TEXT,
    "bachelorUniversity" TEXT,
    "bachelorField" TEXT,
    "bachelorGpa" TEXT,
    "targetDegree" TEXT,
    "targetField" TEXT,
    "targetUniversity" TEXT,
    "targetPreferences" JSONB,
    "jobTitle" TEXT,
    "workExperienceYears" TEXT,
    "currentlyEmployed" BOOLEAN NOT NULL DEFAULT false,
    "howFoundUs" TEXT,
    "referralCode" TEXT,
    "description" TEXT,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Evaluation_status_idx" ON "Evaluation"("status");

-- CreateIndex
CREATE INDEX "Evaluation_createdAt_idx" ON "Evaluation"("createdAt");

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
