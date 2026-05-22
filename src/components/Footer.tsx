import Link from 'next/link';
import type { Dictionary, Locale } from '@/lib/i18n';
import { defaultLocale, localePath } from '@/lib/i18n';
import { PRIMARY_NAV } from '@/config/navigation';
import GermanyTopics from './GermanyTopics';

export default function Footer({ dict, locale = defaultLocale }: { dict: Dictionary; locale?: Locale }) {
  const year = new Date().getFullYear();

  return (
    <>
      <GermanyTopics />
      <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
        <div className="container mx-auto px-4 py-12 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:items-start">
            <div className="text-center md:text-start">
              <p className="text-lg font-semibold text-white">🇩🇪 {dict.meta.title}</p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">{dict.meta.description}</p>
            </div>
            <nav className="flex flex-wrap justify-center gap-6 text-sm font-medium" aria-label="Footer">
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
