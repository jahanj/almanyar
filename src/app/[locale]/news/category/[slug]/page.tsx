import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { breadcrumbLd, localizedUrl, pageMetadata } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import PageHero from '@/components/PageHero';
import PostCard from '@/components/news/PostCard';
import { defaultLocale, type Locale } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 12;

export async function generateMetadata({
  params,
}: { params: { slug: string } }): Promise<Metadata> {
  const cat = await prisma.postCategory.findUnique({
    where: { slug: params.slug },
    select: { name: true },
  });
  if (!cat) return { robots: { index: false, follow: false } };

  return pageMetadata({
    locale: defaultLocale,
    path: `/news/category/${params.slug}`,
    title: `${cat.name} — اخبار آلمانیار`,
    description: `تازه‌ترین خبرها و راهنماهای آلمانیار در دسته‌ی «${cat.name}».`,
    type: 'website',
  });
}

export default async function NewsCategoryPage({
  params,
  searchParams,
}: { params: { slug: string }; searchParams: { page?: string } }) {
  const locale: Locale = defaultLocale;
  const page = Math.max(1, Number(searchParams.page ?? 1));

  const category = await prisma.postCategory.findUnique({ where: { slug: params.slug } });
  if (!category) notFound();

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { status: 'PUBLISHED', categoryId: category.id },
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
    prisma.post.count({ where: { status: 'PUBLISHED', categoryId: category.id } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const jsonLd = breadcrumbLd([
    { name: 'خانه', url: localizedUrl(locale) },
    { name: 'اخبار', url: localizedUrl(locale, '/news') },
    { name: category.name, url: localizedUrl(locale, `/news/category/${category.slug}`) },
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <JsonLd data={jsonLd} />

      <PageHero
        locale={locale}
        eyebrow="اخبار"
        title={category.name}
        subtitle={`تازه‌ترین مطالب در دسته‌ی «${category.name}».`}
        breadcrumbs={[
          { label: 'خانه', href: '/fa' },
          { label: 'اخبار', href: '/fa/news' },
          { label: category.name },
        ]}
      />

      <main className="container mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
            <p className="text-slate-500">هنوز در این دسته خبری منتشر نشده.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-2">
            {page > 1 && (
              <Link
                href={page === 2 ? `/fa/news/category/${category.slug}` : `/fa/news/category/${category.slug}?page=${page - 1}`}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:border-emerald-500"
              >← قبلی</Link>
            )}
            <span className="px-3 py-1.5 text-sm text-slate-600">صفحه {page} از {totalPages}</span>
            {page < totalPages && (
              <Link
                href={`/fa/news/category/${category.slug}?page=${page + 1}`}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:border-emerald-500"
              >بعدی →</Link>
            )}
          </nav>
        )}
      </main>
    </div>
  );
}
