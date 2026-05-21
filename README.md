# GermanBiz — مهاجرت تحصیلی به آلمان

سایت کامل Full-Stack برای مشاوره مهاجرت تحصیلی به آلمان از مسیر ترکیه.

## استک تکنولوژی

- **Frontend & Backend:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + Vazirmatn font
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js (Credentials + JWT)
- **Email:** Nodemailer (SMTP)
- **i18n:** فارسی / ترکی / آلمانی + RTL/LTR خودکار
- **Deployment:** Docker + Docker Compose + Nginx

## قابلیت‌ها

- ✅ صفحه اصلی پاسخگو (Responsive) با ۳ زبان
- ✅ سیستم نظرات و امتیازدهی (تایید توسط ادمین)
- ✅ فرم تماس / درخواست مشاوره (با اطلاع‌رسانی ایمیل به ادمین)
- ✅ ثبت‌نام / ورود کاربران
- ✅ پنل ادمین کامل: داشبورد، مدیریت نظرات، مدیریت درخواست‌ها
- ✅ Rate limiting روی فرم‌های عمومی
- ✅ Validation با Zod
- ✅ آماده برای استقرار روی VPS با Docker

## شروع توسعه (Local Development)

### پیش‌نیازها
- Node.js 20+
- PostgreSQL 14+ (یا Docker)

### مراحل

```bash
# 1. نصب وابستگی‌ها
npm install

# 2. کپی env و ویرایش
cp .env.example .env
# DATABASE_URL، NEXTAUTH_SECRET و ADMIN_PASSWORD رو تنظیم کن
# NEXTAUTH_SECRET: openssl rand -base64 32

# 3. اجرای دیتابیس (با Docker)
docker run -d --name pg \
  -e POSTGRES_DB=germanbiz -e POSTGRES_USER=germanbiz -e POSTGRES_PASSWORD=changeme \
  -p 5432:5432 postgres:16-alpine

# 4. اجرای migration و seed
npx prisma migrate dev --name init
npm run db:seed

# 5. اجرای dev server
npm run dev
```

سایت روی `http://localhost:3000` بالا میاد. پنل ادمین: `/admin` (با ایمیل/پسوردی که در `.env` تنظیم کردی).

## استقرار روی VPS

### پیش‌نیازهای سرور
- Docker + Docker Compose
- یک دامنه که به IP سرور اشاره می‌کنه
- پورت‌های 80 و 443 باز

### مراحل استقرار

```bash
# 1. روی VPS کلون کن
git clone <repo-url> /opt/germanbiz
cd /opt/germanbiz

# 2. متغیرهای محیطی production
cp .env.example .env
nano .env
# تنظیمات کلیدی:
#   POSTGRES_PASSWORD=<strong-password>
#   NEXTAUTH_URL=https://yourdomain.com
#   NEXTAUTH_SECRET=$(openssl rand -base64 32)
#   ADMIN_EMAIL / ADMIN_PASSWORD
#   SMTP_* برای ارسال ایمیل
#   ADMIN_NOTIFY_EMAIL برای دریافت اطلاع درخواست‌های جدید

# 3. ساخت و اجرای کانتینرها
docker compose up -d --build

# 4. اجرای seed (یک بار)
docker compose exec app sh -c "npx tsx prisma/seed.ts"

# 5. (اختیاری) دریافت SSL با Certbot
docker run -it --rm \
  -v $(pwd)/docker/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/docker/certbot/www:/var/www/certbot \
  certbot/certbot certonly --webroot \
  -w /var/www/certbot -d yourdomain.com

# بعد بلوک HTTPS رو در docker/nginx.conf فعال کن و:
docker compose restart nginx
```

### آپدیت

```bash
git pull
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
```

## ساختار پروژه

```
.
├── prisma/
│   ├── schema.prisma          # مدل‌های دیتابیس
│   └── seed.ts                # داده‌های اولیه + ادمین
├── src/
│   ├── app/
│   │   ├── [locale]/          # صفحات با زبان (fa/tr/de)
│   │   ├── admin/             # پنل ادمین
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth + register
│   │   │   ├── reviews/       # API نظرات
│   │   │   ├── contact/       # API فرم تماس
│   │   │   └── admin/         # API های ادمین
│   │   ├── login/
│   │   ├── register/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/            # کامپوننت‌های React
│   ├── lib/
│   │   ├── prisma.ts          # Prisma Client
│   │   ├── auth.ts            # NextAuth config
│   │   ├── i18n.ts            # دیکشنری زبان
│   │   ├── mailer.ts          # SMTP
│   │   ├── rate-limit.ts      # Rate limiting in-memory
│   │   └── admin-guard.ts     # محافظ مسیرهای ادمین
│   ├── locales/               # متون fa/tr/de
│   ├── types/                 # تایپ‌های NextAuth
│   └── middleware.ts          # تشخیص زبان
├── docker/
│   └── nginx.conf
├── Dockerfile
└── docker-compose.yml
```

## نکات امنیتی

- حتما `NEXTAUTH_SECRET` رو با مقدار قوی تنظیم کن (`openssl rand -base64 32`)
- `ADMIN_PASSWORD` پیش‌فرض رو فوراً بعد از اولین ورود از طریق دیتابیس عوض کن
- روی production: HTTPS رو فعال کن (Let's Encrypt)
- Rate limit فعلی in-memory هست؛ برای مقیاس بزرگ Redis اضافه کن

## دستورات مفید

| دستور | توضیح |
|------|------|
| `npm run dev` | اجرای dev server |
| `npm run build` | ساخت production |
| `npm run start` | اجرای production |
| `npm run db:seed` | اجرای seed |
| `npx prisma studio` | UI گرافیکی دیتابیس |
| `npx prisma migrate dev` | ایجاد migration جدید |
| `docker compose logs -f app` | لاگ‌های اپ |
# germanize
