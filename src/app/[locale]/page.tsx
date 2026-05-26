import type { Metadata } from 'next';
import { getDictionary, type Locale, locales } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import HomeClient from '@/components/HomeClient';
import JsonLd from '@/components/JsonLd';
import LatestNewsStrip from '@/components/LatestNewsStrip';
import {
  faqLd,
  pageMetadata,
  turkishAdmissionServiceLd,
  settlementServiceLd,
  germanyConsultingServiceLd,
  personWithRatingLd,
} from '@/lib/seo';
import { PAGE_SEO } from '@/lib/seo-content';
import { loadSiteStats } from '@/lib/site-stats';

// Rendered per-request: the homepage reads live stats + latest posts from
// the DB, which isn't available at Docker build time, so it must not be
// prerendered.
export const dynamic = 'force-dynamic';

function loadLatestPosts() {
  return prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: 3,
    select: {
      slug: true, title: true, excerpt: true,
      coverImageUrl: true, coverImageAlt: true,
      publishedAt: true,
      category: { select: { slug: true, name: true } },
    },
  }).catch(() => []);
}

export function generateMetadata(): Metadata {
  const s = PAGE_SEO.home;
  return pageMetadata({ locale: 'fa', path: s.path, title: s.title, description: s.description });
}

export default async function Home({ params }: { params: { locale: Locale } }) {
  if (!locales.includes(params.locale)) notFound();
  const dict = await getDictionary(params.locale);

  const [stats, latestPosts] = await Promise.all([loadSiteStats(), loadLatestPosts()]);

  return (
    <>
      <JsonLd
        data={[
          // Person+rating overrides the layout's plain personLd because it
          // adds aggregateRating (when reviews >= 5). Same @id, so Google
          // merges them.
          personWithRatingLd(stats),
          // Three Services match the actual business model. See PHASE-2-PLAN §SEO-03.
          turkishAdmissionServiceLd(params.locale),
          settlementServiceLd(params.locale),
          germanyConsultingServiceLd(params.locale),
          faqLd(dict.services.faq),
        ]}
      />
      <HomeClient
        latestNewsSlot={<LatestNewsStrip posts={latestPosts} />}
      />
    </>
  );
}
