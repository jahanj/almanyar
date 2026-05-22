/**
 * Topic-routed exam detail pages, e.g. /fa/exams/dsh, /fa/exams/fsp.
 *
 * Exams is the only group whose index page (/fa/exams) is a bespoke landing
 * (`../page.tsx` — ExamRegisterForm + curated content), so we can't use a
 * catch-all here. This single-segment [slug] route covers all topic detail
 * pages by adapting params and delegating to `topicRoute('exams')`.
 */
import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n';
import { topicRoute } from '@/lib/topic-route';

const route = topicRoute('exams');

export function generateStaticParams() {
  return route
    .generateStaticParams()
    .filter((p) => p.slug && p.slug.length > 0)
    .map((p) => ({ slug: p.slug![0]! }));
}

export function generateMetadata({
  params,
}: {
  params: { locale: Locale; slug: string };
}): Metadata {
  return route.generateMetadata({ params: { locale: params.locale, slug: [params.slug] } });
}

export default function ExamSlugPage({
  params,
}: {
  params: { locale: Locale; slug: string };
}) {
  return route.Page({ params: { locale: params.locale, slug: [params.slug] } });
}
