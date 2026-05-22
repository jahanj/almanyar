import type { Dictionary, Locale } from '@/lib/i18n';
import { localePath } from '@/lib/i18n';

export default function CtaBanner({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <section className="section-padding bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-brand-200/60 bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-10 text-center text-white shadow-glow md:px-12 md:py-14">
          <div
            className="pointer-events-none absolute -end-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{dict.hero.ctaConsult}</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/90 md:text-base">{dict.hero.subtitle}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={localePath(locale, '#contact')}
                className="inline-flex w-full items-center justify-center rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-brand-800 transition hover:bg-brand-50 sm:w-auto"
              >
                {dict.nav.contact}
              </a>
              <a
                href={localePath(locale, '/evaluation')}
                className="inline-flex w-full items-center justify-center rounded-xl border border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
              >
                {dict.nav.evaluation}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
