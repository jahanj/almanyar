import PageHero from '@/components/PageHero';
import { localePath, type Locale } from '@/lib/i18n';

type Block = { heading: string; body: string };

/**
 * Shared layout for legal pages (disclaimer, privacy).
 * Renders the typed legal-content block list with `\n\n` paragraph breaks
 * and lightweight bullet-line support (lines starting with "- ").
 */
export default function LegalPage({
  locale,
  title,
  intro,
  blocks,
  updatedAt,
  breadcrumbLabel,
}: {
  locale: Locale;
  title: string;
  intro: string;
  blocks: readonly Block[];
  updatedAt: string;
  breadcrumbLabel: string;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <PageHero
        locale={locale}
        eyebrow="اطلاعیه قانونی"
        title={title}
        subtitle={intro}
        updatedAt={updatedAt}
        breadcrumbs={[
          { label: 'خانه', href: localePath(locale) },
          { label: breadcrumbLabel },
        ]}
      />

      <main className="container mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
        {blocks.map((b, i) => (
          <section
            key={i}
            aria-labelledby={`legal-${i}`}
            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft md:p-8"
          >
            <h2
              id={`legal-${i}`}
              className="mb-4 text-lg font-bold text-slate-900 md:text-xl"
            >
              {b.heading}
            </h2>
            <div className="space-y-3 leading-8 text-slate-700">
              {b.body.split('\n\n').map((para, pi) => (
                <Paragraph key={pi} text={para} />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

function Paragraph({ text }: { text: string }) {
  const lines = text.split('\n');
  const isBulletBlock = lines.every((l) => l.trim().length === 0 || l.trim().startsWith('- '));
  if (isBulletBlock && lines.some((l) => l.trim().startsWith('- '))) {
    return (
      <ul className="space-y-2 ps-4">
        {lines
          .filter((l) => l.trim().startsWith('- '))
          .map((l, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
              <span className="leading-7">{l.replace(/^\s*-\s*/, '')}</span>
            </li>
          ))}
      </ul>
    );
  }
  return <p>{text}</p>;
}
