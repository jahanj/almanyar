-- Phase-8 §CMS — Post / PostCategory / PostTag schema.
-- Additive only; rollback = drop 4 tables + the enum.

-- ───── PostStatus enum ─────
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- ───── PostCategory ─────
CREATE TABLE "PostCategory" (
  "id"    TEXT NOT NULL,
  "slug"  TEXT NOT NULL,
  "name"  TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "PostCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PostCategory_slug_key" ON "PostCategory"("slug");

-- ───── PostTag ─────
CREATE TABLE "PostTag" (
  "id"   TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,

  CONSTRAINT "PostTag_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PostTag_slug_key" ON "PostTag"("slug");

-- ───── Post ─────
CREATE TABLE "Post" (
  "id"              TEXT NOT NULL,
  "slug"            TEXT NOT NULL,
  "title"           TEXT NOT NULL,
  "seoTitle"        TEXT,
  "metaDescription" TEXT,
  "excerpt"         TEXT,
  "bodyHtml"        TEXT NOT NULL,
  "bodyJson"        JSONB,
  "coverImageUrl"   TEXT,
  "coverImageAlt"   TEXT,
  "status"          "PostStatus" NOT NULL DEFAULT 'DRAFT',
  "publishedAt"     TIMESTAMP(3),
  "authorId"        TEXT,
  "categoryId"      TEXT NOT NULL,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");
CREATE INDEX "Post_status_publishedAt_idx" ON "Post"("status", "publishedAt");
CREATE INDEX "Post_categoryId_idx" ON "Post"("categoryId");
CREATE INDEX "Post_slug_idx" ON "Post"("slug");

ALTER TABLE "Post"
  ADD CONSTRAINT "Post_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Category delete is RESTRICTed so we don't accidentally drop posts.
-- Re-categorize before deleting a category.
ALTER TABLE "Post"
  ADD CONSTRAINT "Post_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "PostCategory"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- ───── PostsOnTags (explicit M2M join) ─────
CREATE TABLE "PostsOnTags" (
  "postId" TEXT NOT NULL,
  "tagId"  TEXT NOT NULL,

  CONSTRAINT "PostsOnTags_pkey" PRIMARY KEY ("postId", "tagId")
);

CREATE INDEX "PostsOnTags_tagId_idx" ON "PostsOnTags"("tagId");

ALTER TABLE "PostsOnTags"
  ADD CONSTRAINT "PostsOnTags_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "Post"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PostsOnTags"
  ADD CONSTRAINT "PostsOnTags_tagId_fkey"
  FOREIGN KEY ("tagId") REFERENCES "PostTag"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ───── Seed the 6 canonical categories ─────
-- IDs are cuid-shaped fixed strings so the same row exists across envs.
-- (Picked manually; Prisma's default cuid() needs Node runtime.)
INSERT INTO "PostCategory" ("id", "slug", "name", "order") VALUES
  ('cat_exams_v1',           'exams',           'آزمون‌ها',          10),
  ('cat_germany_visa_v1',    'germany-visa',    'ویزای آلمان',         20),
  ('cat_study_germany_v1',   'study-germany',   'تحصیل در آلمان',      30),
  ('cat_work_germany_v1',    'work-germany',    'کار در آلمان',        40),
  ('cat_life_germany_v1',    'life-germany',    'زندگی در آلمان',      50),
  ('cat_news_updates_v1',    'news-updates',    'اخبار و به‌روزرسانی‌ها', 60)
ON CONFLICT ("slug") DO NOTHING;
