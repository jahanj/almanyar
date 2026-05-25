# Phase 8 — In-House CMS + Content Architecture (Implementation Report)

**Date:** 2026-05-25
**Status:** Shipped to production (commit `15c7ce2` through `483cd13` + 8G/8H).
**Tests run live:** No (deferred per session preference). Spec files
land in `tests/phase-8/` and join the batch suite via
`playwright.config.ts`.

---

## What shipped

| # | Commit | Scope |
|---|---|---|
| 8A | `15c7ce2` | Prisma `Post` / `PostCategory` / `PostTag` / `PostsOnTags`; migration `20260525_phase8_posts` seeds 6 canonical categories. |
| 8B | `84b48f3` | `/admin/posts` CRUD: list (filterable by status), create, edit, delete. APIs `/api/admin/posts(/[id])` + `/api/admin/post-categories`. Sidebar nav gains "📰 اخبار و مقالات". |
| 8C | `8b03ab2` | TipTap rich-text editor (StarterKit + Link + Placeholder) with Notion-style toolbar, RTL Persian. Cover-image upload via new `POST /api/admin/uploads/image` (admin-only) + public `GET /api/uploads/[name]` (served from STORAGE_DIR volume). PostForm now persists `bodyHtml` (SSR) + `bodyJson` (re-edit fidelity). |
| 8D | `a8702fd` | Public surface: `/fa/news` paginated feed, `/fa/news/[slug]` post page, `/fa/news/category/[slug]` category feed. `PostCard` component (cover fallback gradient per-category). Sitemap async + includes /news + every published post + every category. `BlogPosting` + `BreadcrumbList` + `Article` JSON-LD on post pages. |
| ops | `5a248b5` | Unified WhatsApp glyph (footer 💬 → real icon, floating button shares the same shared `WhatsAppIcon` component). |
| 8E+8F | `483cd13` | `RelatedNews` (server, scored by category +3 / shared-tag +1 / recency +0.5) under every news post. `RelatedLinks` hand-curated under turkey-residence, turkey-costs, germany-visa-from-turkey. Homepage dropped Process/Education/TurkeyResidence/Testimonials (12→8 sections). `LatestNewsStrip` shows 3 most recent posts between Services and CtaBanner. |
| 8G | (this commit) | Internal-link picker in editor: new toolbar 📎 button opens a modal listing all posts + topics + static pages (server feeds `/api/admin/internal-links`); click to insert link with title as anchor text. |
| 8H | (this commit) | 3 Playwright specs in `tests/phase-8/`, this report. |

---

## Decisions honored (PHASE-8-PLAN locked, see file top)

- **CMS approach** = in-house (admin route + Prisma + TipTap). ✅
- **URL** = `/fa/news/<slug>` (not `/blog/`, not `/articles/`). ✅
- **Homepage trim** done inside Phase 8 (sub-phase 8F). ✅
- **No scheduled posts** — only DRAFT/PUBLISHED. ✅
- **Author byline** = "آلمانیار" (brand) — no per-post byline UI; LD
  author is the Person LD via `@id`. ✅
- **news-updates** as a category, not a tag. ✅ (seeded in migration)
- **Cover image** optional; gradient fallback per category. ✅

---

## Architectural choices worth recording

- **Two content layers**: existing topic pages (`src/lib/topic-content/*.ts`,
  ~35 evergreen authority pages) stay in code. Posts (DB) are time-ordered
  news/updates. They share the same `PostCard`/`RelatedNews` visual system
  but never the same backing store.
- **bodyHtml + bodyJson**: TipTap's JSON is the re-edit source of truth;
  HTML is pre-rendered for fast SSR. Both stored.
- **Image upload pipeline**: reused `lib/storage.ts` (already used by
  documents). Cover/inline images go to `STORAGE_DIR` (named docker
  volume so they persist across rebuilds), served by an auth-free
  `/api/uploads/[name]` GET route with 1-day immutable cache.
- **Slug strategy**: Persian-safe slugify (keeps non-ASCII chars; Google
  handles fa-IR slugs cleanly). Admin can override.
- **publishedAt** stamped on first DRAFT→PUBLISHED and never cleared on
  unpublish — preserves SEO date authority across edits.
- **Slot pattern for HomeClient**: `LatestNewsStrip` rendered server-side
  inside `[locale]/page.tsx` and passed as a slot prop into HomeClient
  ('use client'), so DB I/O stays on the server and the client component
  doesn't need a fetch.
- **`Prisma.JsonNull`**: needed for nullable JSON columns because
  Prisma's typed nullability differentiates "absent" from "explicitly
  null"; first-time bite of Phase 8C build.

---

## Tests

New specs in `tests/phase-8/`:
1. `01-news-public.spec.ts` — `/fa/news` 200, all 6 category chips
   visible, `/fa/news/category/germany-visa` 200.
2. `02-admin-posts-auth.spec.ts` — every admin Post endpoint (incl. the
   internal-links + uploads/image routes) rejects unauthenticated
   requests with 401/403. Same pattern as Phase-4 admin-notify auth
   suite.
3. `03-homepage-trim.spec.ts` — asserts the 4 removed homepage sections
   are gone and the 4 retained ones still render, by visible heading.

`playwright.config.ts` extended to include `phase-8/**/*.spec.ts`.

### Manual verification checklist (live)
1. Log in as admin → `/admin/posts/new`. Write a sample post with
   TipTap (try H2, bold, list, blockquote, code, link). Upload a cover.
   Press the 📎 button → pick an internal link → confirm inserted.
   Save → status `PUBLISHED`.
2. Visit `/fa/news` — your post appears as the first card.
3. Click the card → `/fa/news/<slug>` renders with cover, body, tags,
   "مطالب مرتبط" empty (only one post; will fill as more land).
4. Visit `/fa` — "آخرین خبرها و راهنماها" strip appears between
   Services and CtaBanner with your post.
5. Confirm `/fa/turkey-residence`, `/fa/turkey-costs`, and
   `/fa/germany-visa-from-turkey` each show the "مطالب مرتبط" block at
   the bottom.
6. Confirm Process / Education / TurkeyResidence / Testimonials sections
   are gone from `/fa`.
7. Footer WhatsApp + floating WhatsApp button — both show the official
   green icon, not 💬 / not a green blob.
8. Cross-user probe (unauth): `curl https://almanyar.com/api/admin/posts`
   → 401. Same for the other admin endpoints.

---

## Deployment notes

- Single new migration `20260525_phase8_posts` — additive, no destructive
  changes. Categories pre-seeded with fixed IDs so dev + prod stay in
  sync.
- New deps: `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`,
  `@tiptap/extension-link`, `@tiptap/extension-placeholder` (~150KB,
  admin route only, no impact on public bundle).
- No new env vars.
- Image storage reuses `STORAGE_DIR` (already mounted as a docker
  volume); covers persist across container rebuilds.

---

## Known follow-ups (out of scope this phase)

- **In-editor inline images** — current TipTap setup doesn't expose image
  insertion in the toolbar (only via paste-URL link). Adding the
  `@tiptap/extension-image` + a toolbar button is small but deferred.
- **TipTap slash-commands** — the 📎 picker covers internal links;
  a full `/`-triggered command palette would be polish.
- **Comments / discussion on posts** — Decision left out of Phase 8.
- **Newsletter generation from latest posts** — natural extension once
  marketing list gets real volume.
- **Hub "latest news in this category" strips** — turkey-residence and
  friends use static RelatedLinks today; could swap in `<RelatedNews
  categorySlug="…" />` once we have ≥5 posts per category.
- **Author profiles** — single brand byline today; pluralisation is a
  future call.
