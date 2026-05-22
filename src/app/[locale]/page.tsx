import type { Metadata } from 'next';
import { getDictionary, type Locale, locales } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import HomeClient from '@/components/HomeClient';
import JsonLd from '@/components/JsonLd';
import { faqLd, pageMetadata, serviceLd } from '@/lib/seo';
import { PAGE_SEO } from '@/lib/seo-content';
import { loadSiteStats } from '@/lib/site-stats';

// Rendered per-request: the homepage reads live reviews/ratings from the DB,
// which isn't available at Docker build time, so it must not be prerendered.
export const dynamic = 'force-dynamic';

const REVIEW_LOAD_TIMEOUT_MS = 1500;

type ReviewRow = {
  id: string;
  authorName: string;
  rating: number;
  title: string | null;
  content: string;
  createdAt: Date;
};

function loadHomepageReviews() {
  const query = Promise.all([
    prisma.review.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: 9,
      select: { id: true, authorName: true, rating: true, title: true, content: true, createdAt: true },
    }),
    prisma.review.aggregate({ where: { status: 'APPROVED' }, _avg: { rating: true }, _count: true }),
  ])
    .then(([reviews, agg]) => ({ reviews, agg }))
    .catch(() => null);

  const timeout = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), REVIEW_LOAD_TIMEOUT_MS);
  });

  return Promise.race([query, timeout]);
}

export function generateMetadata(): Metadata {
  const s = PAGE_SEO.home;
  return pageMetadata({ locale: 'fa', path: s.path, title: s.title, description: s.description });
}

export default async function Home({ params }: { params: { locale: Locale } }) {
  if (!locales.includes(params.locale)) notFound();
  const dict = await getDictionary(params.locale);

  const [result, stats] = await Promise.all([loadHomepageReviews(), loadSiteStats()]);

  const reviews: ReviewRow[] = result?.reviews ?? [];
  const serialized = reviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));

  return (
    <>
      <JsonLd data={[serviceLd(params.locale), faqLd(dict.services.faq)]} />
      <HomeClient
        dict={dict}
        locale={params.locale}
        initialReviews={serialized}
        stats={stats}
      />
    </>
  );
}
