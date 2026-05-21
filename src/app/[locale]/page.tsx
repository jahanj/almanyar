import { getDictionary, type Locale, locales } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import HomeClient from '@/components/HomeClient';

export const revalidate = 60;

export default async function Home({ params }: { params: { locale: Locale } }) {
  if (!locales.includes(params.locale)) notFound();
  const dict = await getDictionary(params.locale);

  const [reviews, agg] = await Promise.all([
    prisma.review.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: 9,
      select: {
        id: true,
        authorName: true,
        rating: true,
        title: true,
        content: true,
        createdAt: true,
      },
    }),
    prisma.review.aggregate({
      where: { status: 'APPROVED' },
      _avg: { rating: true },
      _count: true,
    }),
  ]);

  const serialized = reviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));

  return (
    <HomeClient
      dict={dict}
      locale={params.locale}
      initialReviews={serialized}
      averageRating={Number(agg._avg.rating ?? 0)}
      totalReviews={agg._count}
    />
  );
}
