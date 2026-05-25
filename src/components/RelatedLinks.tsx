import Link from 'next/link';

/**
 * Phase-8E — hand-curated "see also" block.
 *
 * For bespoke pages (turkey-residence, turkey-costs, germany-visa-from-turkey,
 * about, how-it-works, ...) that aren't in the topic registry, this gives
 * the author a way to nudge readers toward related content without
 * pulling everything into the topic system.
 *
 * Pure presentational — no DB, no I/O. Caller supplies the links.
 */

export interface RelatedLink {
  title: string;
  description?: string;
  href: string;
  icon?: string;
  /** Optional accent gradient class — same palette as topic GROUP_STYLE. */
  accent?: 'green' | 'blue' | 'amber' | 'rose' | 'purple' | 'slate';
}

const ACCENT: Record<NonNullable<RelatedLink['accent']>, string> = {
  green:  'from-emerald-500 to-teal-600',
  blue:   'from-blue-500 to-indigo-600',
  amber:  'from-amber-500 to-orange-600',
  rose:   'from-rose-500 to-red-600',
  purple: 'from-purple-500 to-fuchsia-600',
  slate:  'from-slate-500 to-slate-700',
};

export default function RelatedLinks({
  heading = 'مطالب مرتبط',
  items,
}: {
  heading?: string;
  items: RelatedLink[];
}) {
  if (items.length === 0) return null;

  return (
    <section
      aria-label={heading}
      className="mt-12 border-t border-slate-200 pt-10"
    >
      <h2 className="mb-6 text-xl font-bold text-slate-900 md:text-2xl">{heading}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="group flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
          >
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${ACCENT[it.accent ?? 'green']} text-white text-2xl`}
              aria-hidden="true"
            >
              {it.icon ?? '→'}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-base font-semibold leading-snug text-slate-900 group-hover:text-emerald-700">
                {it.title}
              </span>
              {it.description && (
                <span className="mt-1 block text-sm leading-6 text-slate-500">
                  {it.description}
                </span>
              )}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
