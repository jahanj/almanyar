import Link from 'next/link';
import type { Dictionary, Locale } from '@/lib/i18n';
import { defaultLocale, localePath } from '@/lib/i18n';
import { PRIMARY_NAV } from '@/config/navigation';
import {
  CONTACT_EMAIL,
  CONTACT_EMAIL_MAILTO,
  OFFICE_CITY_FA,
  WHATSAPP_PHONE,
  WHATSAPP_URL,
} from '@/config/contact';
import GermanyTopics from './GermanyTopics';

export default function Footer({ dict, locale = defaultLocale }: { dict: Dictionary; locale?: Locale }) {
  const year = new Date().getFullYear();

  return (
    <>
      <GermanyTopics />
      <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
        <div className="container mx-auto px-4 py-12 sm:px-6">
          {/* Top row: brand blurb, primary nav, and the new contact column. */}
          <div className="grid gap-10 md:grid-cols-[1fr_auto_auto] md:items-start">
            <div className="text-center md:text-start">
              <p className="text-lg font-semibold text-white">🇩🇪 {dict.meta.title}</p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">{dict.meta.description}</p>
            </div>

            <nav
              className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-medium md:flex-col md:items-end md:gap-2"
              aria-label="Footer"
            >
              {PRIMARY_NAV.map((item) => {
                const href = item.hash ? localePath(locale, item.hash) : localePath(locale, item.path);
                return (
                  <Link key={item.dictKey} href={href} className="transition hover:text-white">
                    {dict.nav[item.dictKey]}
                  </Link>
                );
              })}
              <Link href="/login" className="transition hover:text-white">
                {dict.nav.login}
              </Link>
            </nav>

            {/* TRUST-03 — contact column. No social icons (none active). */}
            <div
              data-testid="footer-contact"
              className="flex flex-col gap-2 text-sm text-slate-400 md:items-end md:text-end"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">تماس</p>
              <a
                href={CONTACT_EMAIL_MAILTO}
                className="transition hover:text-white"
                dir="ltr"
              >
                {CONTACT_EMAIL}
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition hover:text-white"
                dir="ltr"
              >
                <span aria-hidden="true">💬</span>
                {WHATSAPP_PHONE}
              </a>
              <p className="text-slate-500">{OFFICE_CITY_FA}</p>
            </div>
          </div>

          {/* Legal links — required by LEGAL-01/02. */}
          <nav
            className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-slate-500 md:justify-start"
            aria-label="Legal"
          >
            <Link href={localePath(locale, '/disclaimer')} className="transition hover:text-slate-300">
              سلب مسئولیت
            </Link>
            <Link href={localePath(locale, '/privacy')} className="transition hover:text-slate-300">
              حریم خصوصی
            </Link>
            <Link href={localePath(locale, '/how-it-works')} className="transition hover:text-slate-300">
              نحوه کار ما
            </Link>
          </nav>

          {/* LEGAL-05 — independence disclosure. Sits ABOVE the © line. */}
          <p
            className="mt-6 text-center text-xs leading-6 text-slate-500 md:text-start"
            data-testid="footer-independence"
          >
            آلمانیار یک منبع اطلاع‌رسانی مستقل است و وابسته به هیچ نهاد رسمی نیست.
          </p>

          <div className="mt-3 border-t border-slate-800 pt-6 text-center text-sm text-slate-500 md:text-start">
            © {year} — {dict.footer.rights}
          </div>
        </div>
      </footer>
    </>
  );
}
