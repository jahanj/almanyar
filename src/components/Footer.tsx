import Link from 'next/link';
import type { Dictionary, Locale } from '@/lib/i18n';
import { defaultLocale, localePath } from '@/lib/i18n';
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
              <Link href={localePath(locale, '#services')} className="transition hover:text-white">
                {dict.nav.services}
              </Link>
              <Link href={localePath(locale, '#process')} className="transition hover:text-white">
                {dict.nav.process}
              </Link>
              <Link href={localePath(locale, '#contact')} className="transition hover:text-white">
                {dict.nav.contact}
              </Link>
              <Link href="/login" className="transition hover:text-white">
                {dict.nav.login}
              </Link>
            </nav>
          </div>
          <div className="mt-10 border-t border-slate-800 pt-6 text-center text-sm text-slate-500 md:text-start">
            © {year} — {dict.footer.rights}
          </div>
        </div>
      </footer>
    </>
  );
}
