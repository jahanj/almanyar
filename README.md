# AlmanYar — آلمانیار

The source for **[almanyar.com](https://almanyar.com)** — a Persian-language
consultancy site for students moving to Germany via Turkey. Built and run by
a single consultant: editorial content, lead intake, document review, and a
co-managed student workspace, all in one Next.js app.

> سایت رسمی آلمانیار: مشاوره‌ی مهاجرت تحصیلی به آلمان از مسیر ترکیه.

## Why this repo is public

This is a **portfolio-style release**. The code is here so anyone can read it
and follow how the site is built, but it's not open source — see
[License](#license) below. If you find something interesting, useful, or
broken, you're very welcome to open an issue or reach out.

## Tech stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + Vazirmatn (RTL)
- **Database:** PostgreSQL 16 + Prisma 5
- **Auth:** NextAuth.js (Credentials + JWT sessions)
- **Email:** Nodemailer (SMTP — Brevo / Mailgun compatible)
- **Hero:** GSAP ScrollTrigger pinned cinematic scene
- **Deployment:** Docker Compose + Nginx + Let's Encrypt

## What's in it

- Cinematic scroll-driven homepage (`CinematicJourneyHero`) with a
  reduced-motion static fallback
- ~35 deep topic pages auto-generated from typed content modules
  (visa, study, work, life, exams)
- Persian-only public site with a registry-driven sitemap + hreflang +
  `Person` / `WebSite` / `Service` / `BreadcrumbList` JSON-LD
- Customer dashboard with multi-application document upload and a
  co-managed roadmap timeline (admin defines steps, student ticks them,
  admin confirms — two-key DONE)
- Admin panel for reviews moderation, contact requests, evaluations,
  applications, document review, task editor, and a per-card "email the
  customer" button with rate-limited audit log
- Marketing opt-in with HMAC-signed unsubscribe tokens
- Per-event notification emails with a 5/user/kind/case/day cap

## Local development

> This setup is for reading and experimenting locally. The repo isn't
> meant to be re-deployed as-is — branding, content, and contact details
> belong to AlmanYar.

```bash
# 1. Install
npm install

# 2. Copy env template and edit
cp .env.example .env
# Set NEXTAUTH_SECRET (openssl rand -base64 32) and ADMIN_PASSWORD

# 3. Start Postgres (Docker)
docker run -d --name almanyar-pg \
  -e POSTGRES_DB=germanbiz \
  -e POSTGRES_USER=germanbiz \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 postgres:16-alpine

# 4. Apply migrations and seed
npx prisma migrate deploy
npx tsx prisma/seed.ts

# 5. Run
npm run dev
# → http://localhost:3000/fa
```

Admin panel: `http://localhost:3000/admin` (use the `ADMIN_EMAIL` /
`ADMIN_PASSWORD` from your `.env`).

## Repository layout

```
prisma/
  schema.prisma           # Postgres models
  migrations/             # 11 migrations, additive history
  seed.ts                 # Admin user + sample data
src/
  app/
    [locale]/             # Public marketing pages (fa)
    admin/                # Admin-only panel
    dashboard/            # Logged-in customer area
    api/                  # Public + admin route handlers
  components/             # React components (cinematic hero, forms, panels)
  lib/                    # SEO, auth, mailer, notify, owner identity
  config/                 # Route registry, contact config
  middleware.ts           # Locale + auth gates
docker/
  nginx.conf              # Production reverse proxy + HTTPS
tests/
  phase-1..5/             # Playwright suites, grouped per shipping phase
PHASE-*-PLAN.md           # Per-phase scope + decisions
PHASE-*-REPORT.md         # Per-phase shipping notes
DEPLOY.md                 # VPS deploy guide (Docker + Let's Encrypt)
```

## Production deployment

See [`DEPLOY.md`](./DEPLOY.md). Production runs on a single Hetzner VPS
behind Docker Compose (app + Postgres + nginx + certbot bind-mount).

**Before every production deploy, run `npm run build` locally** — the
prebuild hook refreshes the git-lastmod manifest used by the sitemap, and
SWC's parser catches errors that `tsc --noEmit` misses.

## Documentation

- [`DEPLOY.md`](./DEPLOY.md) — server setup, SSL, ongoing updates
- [`SECURITY.md`](./SECURITY.md) — vulnerability disclosure policy
- `PHASE-N-PLAN.md` / `PHASE-N-REPORT.md` — engineering decisions and shipping notes per phase

## License

**© 2026 Mohammad Jahanbani. All rights reserved.**

This code is published for transparency and as a portfolio artifact. It is
**not open source**: copying, modifying, redistributing, or running it as a
competing service is not permitted without written permission. You are
welcome to read it, link to it, and reference it in discussions or articles
with attribution.

## Contact

- Site: [almanyar.com](https://almanyar.com)
- Email: info@almanyar.com
- WhatsApp: +90 506 770 8295
