import Link from 'next/link';
import type { Locale } from '@/lib/i18n';
import { localePath } from '@/lib/i18n';

type Breadcrumb = { label: string; href?: string };

type PageHeroProps = {
  locale: Locale;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  icon?: string;
  breadcrumbs?: Breadcrumb[];
  variant?: 'light' | 'brand';
  accentGradient?: string;
  children?: React.ReactNode;
};

export default function PageHero({
  locale,
  title,
  subtitle,
  eyebrow,
  icon,
  breadcrumbs,
  variant = 'light',
  accentGradient,
  children,
}: PageHeroProps) {
  const isAccent = Boolean(accentGradient);
  const isBrand = variant === 'brand' || isAccent;

  return (
    <section
      className={[
        'relative overflow-hidden pt-24 pb-14 md:pt-32 md:pb-20',
        isAccent
          ? `bg-gradient-to-br ${accentGradient} text-white`
          : isBrand
            ? 'bg-slate-900 text-white'
            : 'bg-slate-50 text-slate-900',
      ].join(' ')}
    >
      {!isBrand && (
        <>
          <div className="absolute inset-0 bg-mesh-hero" aria-hidden="true" />
          <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-50" aria-hidden="true" />
        </>
      )}
      {isBrand && !isAccent && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-transparent to-brand-800/10"
          aria-hidden="true"
        />
      )}

      <div className="container relative mx-auto max-w-4xl px-4 sm:px-6">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="مسیر" className="mb-5 text-sm text-slate-500">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.label}>
                {i > 0 && <span className="mx-2 opacity-60">›</span>}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className={isBrand ? 'text-white/80 hover:text-white' : 'hover:text-brand-700'}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    aria-current="page"
                    className={isBrand ? 'text-white/90' : 'text-slate-700'}
                  >
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}

        {eyebrow && (
          <span
            className={[
              'mb-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider',
              isBrand
                ? 'border border-white/20 bg-white/10 text-white'
                : 'border border-brand-200 bg-brand-50 text-brand-700',
            ].join(' ')}
          >
            {eyebrow}
          </span>
        )}

        {icon && <div className="mb-4 text-4xl md:text-5xl">{icon}</div>}

        <h1
          className={[
            'text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl leading-tight',
            !isBrand && 'gradient-text',
            isAccent && 'text-white',
          ].join(' ')}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className={[
              'mt-4 max-w-3xl text-base leading-relaxed md:text-lg',
              isBrand ? 'text-white/85' : 'text-slate-600',
            ].join(' ')}
          >
            {subtitle}
          </p>
        )}

        {children && <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{children}</div>}
      </div>
    </section>
  );
}

export function pageCtaPrimary(href: string, label: string) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-700"
    >
      {label}
    </Link>
  );
}

export function pageCtaSecondary(href: string, label: string) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-soft transition hover:bg-slate-50"
    >
      {label}
    </Link>
  );
}
