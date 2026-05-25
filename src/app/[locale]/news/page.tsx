import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { pageMetadata, breadcrumbLd, localizedUrl, SITE } from '@/lib/seo';
import PageHero from '@/components/PageHero';
import JsonLd from '@/components/JsonLd';
import PostCard from '@/components/news/PostCard';
import { defaultLocale, type Locale } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 12;

export function generateMetadata(): Metadata {
  return pageMetadata({
    locale: defaultLocale,
    path: '/news',
    title: 'اخبار و به‌روزرسانی‌ها | آلمانیار',
    description: 'تازه‌ترین خبرها و راهنماهای آلمانیار درباره ویزای آلمان، تحصیل، کار، اقامت و زندگی — به‌روز از مسیر ترکیه.',
    type: 'website',
  });
}

export default async function NewsFeedPage({
  searchParams,
}: { searchParams: { page?: string } }) {
  const locale: Locale = defaultLocale;
  const page = Math.max(1, Number(searchParams.page ?? 1));

  const [posts, total, categories] = await Promise.all([
    prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      select: {
        slug: true, title: true, excerpt: true,
        coverImageUrl: true, coverImageAlt: true,
        publishedAt: true,
        category: { select: { slug: true, name: true } },
      },
    }),
    prisma.post.count({ where: { status: 'PUBLISHED' } }),
    prisma.postCategory.findMany({ orderBy: { order: 'asc' }, select: { slug: true, name: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const jsonLd = [
    breadcrumbLd([
      { name: 'خانه', url: localizedUrl(locale) },
      { name: 'اخبار', url: localizedUrl(locale, '/news') },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      '@id': `${SITE.url}/fa/news`,
      name: 'اخبار و به‌روزرسانی‌های آلمانیار',
      url: `${SITE.url}/fa/news`,
      publisher: { '@id': `${SITE.url}/#person` },
      blogPost: posts.slice(0, 10).map((p) => ({
        '@type': 'BlogPosting',
        headline: p.title,
        url: `${SITE.url}/fa/news/${p.slug}`,
        datePublished: p.publishedAt?.toISOString(),
        image: p.coverImageUrl ? `${SITE.url}${p.coverImageUrl}` : `${SITE.url}/og.png`,
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <JsonLd data={jsonLd} />

      <PageHero
        locale={locale}
        title="اخبار و به‌روزرسانی‌ها"
        subtitle="تازه‌ترین خبرها و تحلیل‌ها درباره مهاجرت تحصیلی به آلمان از مسیر ترکیه."
        breadcrumbs={[
          { label: 'خانه', href: '/fa' },
          { label: 'اخبار' },
        ]}
      />

      <main className="container mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Category chips */}
        {categories.length > 0 && (
          <nav className="mb-8 flex flex-wrap gap-2" aria-label="دسته‌بندی‌ها">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/fa/news/category/${c.slug}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 transition hover:border-emerald-500 hover:text-emerald-700"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        )}

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
            <p className="text-slate-500">هنوز خبری منتشر نشده. به‌زودی بازگردید.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} basePath="/fa/news" />
        )}
      </main>
    </div>
  );
}

function Pagination({
  page, totalPages, basePath,
}: { page: number; totalPages: number; basePath: string }) {
  const hrefFor = (p: number) => p === 1 ? basePath : `${basePath}?page=${p}`;
  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="صفحه‌بندی">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:border-emerald-500">
          ← قبلی
        </Link>
      )}
      <span className="px-3 py-1.5 text-sm text-slate-600">
        صفحه {page} از {totalPages}
      </span>
      {page < totalPages && (
        <Link href={hrefFor(page + 1)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:border-emerald-500">
          بعدی →
        </Link>
      )}
    </nav>
  );
}
