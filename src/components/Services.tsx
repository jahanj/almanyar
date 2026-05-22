import type { Dictionary } from '@/lib/i18n';
import SectionHeader from './SectionHeader';

const accentStyles = [
  { ring: 'ring-blue-100', icon: 'bg-blue-50 text-blue-600' },
  { ring: 'ring-emerald-100', icon: 'bg-emerald-50 text-emerald-600' },
  { ring: 'ring-violet-100', icon: 'bg-violet-50 text-violet-600' },
  { ring: 'ring-rose-100', icon: 'bg-rose-50 text-rose-600' },
  { ring: 'ring-amber-100', icon: 'bg-amber-50 text-amber-600' },
  { ring: 'ring-indigo-100', icon: 'bg-indigo-50 text-indigo-600' },
] as const;

export default function Services({ dict }: { dict: Dictionary }) {
  return (
    <section id="services" className="section-padding bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow={dict.nav.services}
          title={dict.services.title}
          subtitle={dict.services.subtitle}
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {dict.services.items.map((item, idx) => {
            const isGermanAccent = 'accent' in item && item.accent === 'germany';
            const style = accentStyles[idx % accentStyles.length]!;
            const details = 'details' in item && Array.isArray(item.details) ? item.details : null;
            const detailsTitle = 'detailsTitle' in item && typeof item.detailsTitle === 'string' ? item.detailsTitle : null;
            const ctaText = 'ctaText' in item && typeof item.ctaText === 'string' ? item.ctaText : null;
            const ctaHref = 'ctaHref' in item && typeof item.ctaHref === 'string' ? item.ctaHref : null;

            return (
              <div
                key={item.title}
                className={[
                  'card-hover group flex h-full flex-col rounded-2xl border bg-white p-6 shadow-soft transition',
                  isGermanAccent
                    ? 'border-amber-200 ring-2 ring-amber-100 sm:col-span-2 lg:col-span-1 xl:col-span-2'
                    : `border-slate-200/80 ${style.ring} ring-1`,
                ].join(' ')}
              >
                <div
                  className={[
                    'mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl',
                    isGermanAccent ? 'bg-gradient-to-br from-slate-900 via-red-600 to-amber-500 text-white' : style.icon,
                  ].join(' ')}
                >
                  {item.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold leading-snug text-slate-900">{item.title}</h3>
                <p className="flex-1 text-sm leading-relaxed text-slate-600">{item.text}</p>

                {details && detailsTitle && (
                  <details className="mt-4 rounded-xl border border-amber-100 bg-amber-50/50 p-4 text-sm text-slate-700">
                    <summary className="cursor-pointer list-none font-semibold text-amber-900">
                      {detailsTitle}
                      <span className="ms-2 text-amber-600">+</span>
                    </summary>
                    <ul className="mt-3 space-y-2 leading-7">
                      {details.map((detail) => (
                        <li key={detail} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}

                {ctaText && ctaHref && (
                  <a
                    href={ctaHref}
                    className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    {ctaText}
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {dict.services.faq.length > 0 && (
          <div className="mx-auto mt-16 max-w-5xl">
            <SectionHeader title={dict.services.faqTitle} align="center" className="mb-8" />
            <div className="grid gap-4 md:grid-cols-2">
              {dict.services.faq.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 shadow-soft transition open:bg-white open:shadow-card"
                >
                  <summary className="cursor-pointer list-none font-semibold leading-8 text-slate-900">
                    {item.q}
                    <span className="ms-2 text-brand-600 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 border-t border-slate-200 pt-3 text-sm leading-7 text-slate-600">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
