# استقرار GermanBiz روی VPS (از صفر تا آنلاین)

این راهنما سایت رو روی یک سرور خارجی (مثلاً **Hetzner**) با Docker و HTTPS بالا میاره.
با هر VPS اوبونتویی دیگه (DigitalOcean, Contabo, ...) هم کار می‌کنه.

---

## ۰) چیزهایی که باید از قبل تهیه کنی
- ✅ یک **VPS** با Ubuntu 22.04/24.04 (Hetzner CX22 کافیه) و دسترسی SSH.
- ✅ یک **دامنه** (مثلاً `germanbiz.com`).
- ✅ (اختیاری ولی توصیه‌شده) اطلاعات **SMTP** برای ارسال ایمیل (Brevo/Mailgun/Resend).

---

## ۱) DNS دامنه رو به سرور وصل کن
در پنل دامنه‌ات دو رکورد A بساز که به IP سرور اشاره کنن:

| Type | Name | Value |
|------|------|-------|
| A | `@`   | `IP سرور` |
| A | `www` | `IP سرور` |

> چند دقیقه تا چند ساعت طول می‌کشه تا DNS منتشر بشه. با `ping germanbiz.com` چک کن که IP درست برگرده.

---

## ۲) ورود به سرور و نصب Docker
```bash
ssh root@SERVER_IP

# نصب Docker + Compose
curl -fsSL https://get.docker.com | sh

# (توصیه‌شده) فایروال: فقط SSH و وب باز باشه
apt-get update && apt-get install -y ufw
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable
```

---

## ۳) آوردن کد روی سرور
**گزینه الف — با Git (توصیه‌شده):**
```bash
git clone <repo-url> /opt/germanbiz && cd /opt/germanbiz
```
**گزینه ب — بدون Git (آپلود مستقیم از کامپیوترت):**

⚠️ **مهم — exclude کردن `docker/certbot/`**: گواهی‌های Let's Encrypt و فایل‌های ACME-challenge فقط روی سرور وجود دارند (در `docker/certbot/conf/` و `docker/certbot/www/`)؛ در ریپو commit نشده‌اند. اگر آن‌ها را exclude نکنید و از flagهایی مثل `--delete` / `--delete-after` استفاده کنید، **rsync کل گواهی HTTPS را پاک می‌کند** و سایت به محض restart کانتینر nginx از کار می‌افتد. همیشه از `.rsyncignore` پروژه استفاده کنید:

```bash
# روی کامپیوتر خودت، از پوشه‌ی پروژه:
rsync -av --exclude-from=.rsyncignore ./ root@SERVER_IP:/opt/germanbiz/
# بعد روی سرور:
cd /opt/germanbiz
```

فایل `.rsyncignore` در ریشه‌ی ریپو هست و این موارد را exclude می‌کند:
`node_modules/`, `.next/`, `.git/`, `postgres-data/`, `uploads/`, `docker/certbot/`,
`.env`, `.env.local`, `*.log`, `test-results/`, `playwright-report/`.

---

## ۴) تنظیم متغیرهای محیطی
```bash
cp .env.production.example .env
nano .env
```
این‌ها رو پر کن:
- `NEXTAUTH_URL=https://YOURDOMAIN.com`  ← دامنه‌ی واقعی
- `ADMIN_EMAIL` و در صورت نیاز `ADMIN_NOTIFY_EMAIL`
- مقادیر `SMTP_*` (اگه ایمیل می‌خوای)
- `POSTGRES_PASSWORD` و `NEXTAUTH_SECRET` و `ADMIN_PASSWORD` از قبل تولید شدن — می‌تونی نگه‌داری یا عوضشون کنی.
  - تولید مجدد سکرت: `openssl rand -base64 32`

---

## ۵) اولین استقرار (HTTP)
```bash
./deploy.sh
```
این دستور: ایمیج رو می‌سازه، کانتینرها (app + postgres + nginx) رو بالا میاره،
مایگریشن دیتابیس رو اجرا می‌کنه و ادمین رو می‌سازه.

حالا تست کن: `http://YOURDOMAIN.com` باید بالا بیاد. ✅

---

## ۶) فعال‌کردن HTTPS (Let's Encrypt)
وقتی سایت روی HTTP کار کرد و DNS درست بود:
```bash
# گرفتن گواهی (دامنه رو با مال خودت عوض کن)
docker run -it --rm \
  -v "$(pwd)/docker/certbot/conf:/etc/letsencrypt" \
  -v "$(pwd)/docker/certbot/www:/var/www/certbot" \
  certbot/certbot certonly --webroot -w /var/www/certbot \
  -d YOURDOMAIN.com -d www.YOURDOMAIN.com
```
بعد در `docker/nginx.conf` بلوک `# HTTPS server` رو از کامنت دربیار و `yourdomain.com`
رو با دامنه‌ات عوض کن، سپس:
```bash
docker compose restart nginx
```
الان `https://YOURDOMAIN.com` باید با قفل سبز کار کنه. 🔒

**تمدید خودکار گواهی** (هر ۹۰ روز منقضی میشه) — یک cron بساز:
```bash
echo '0 3 * * * cd /opt/germanbiz && docker run --rm -v "$(pwd)/docker/certbot/conf:/etc/letsencrypt" -v "$(pwd)/docker/certbot/www:/var/www/certbot" certbot/certbot renew --quiet && docker compose restart nginx' | crontab -
```

---

## ۷) ورود به پنل ادمین
به `https://YOURDOMAIN.com/login` برو و با `ADMIN_EMAIL` / `ADMIN_PASSWORD` وارد شو،
بعد فوراً رمز رو از پنل عوض کن.

---

## آپدیت سایت در آینده
```bash
cd /opt/germanbiz
git pull            # یا دوباره rsync کن
./deploy.sh
```

## دستورات مفید
```bash
docker compose logs -f app      # لاگ زنده‌ی اپ
docker compose ps               # وضعیت کانتینرها
docker compose down             # خاموش‌کردن (داده‌ها در volumeها می‌مونن)
```

## نکات مهم
- 📁 فایل‌های آپلودشده در volume به نام `uploads` و دیتابیس در `./postgres-data` ذخیره می‌شن و با restart پاک **نمی‌شن**.
- 🔒 پورت دیتابیس فقط روی `127.0.0.1` باز شده و از اینترنت در دسترس نیست.
- 💾 بکاپ دیتابیس: `docker compose exec -T postgres pg_dump -U germanbiz germanbiz > backup_$(date +%F).sql`
