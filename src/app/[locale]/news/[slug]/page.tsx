import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { articleLd, breadcrumbLd, localizedUrl, pageMetadata, SITE } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import PageHero from '@/components/PageHero';
import RelatedNews from '@/components/news/RelatedNews';
import { formatJalali } from '@/lib/dates';
import { defaultLocale, type Locale } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

async function loadPost(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: {
      category: { select: { slug: true, name: true } },
      tags: { select: { tag: { select: { slug: true, name: true } } } },
    },
  });
}

export async function generateMetadata({
  params,
}: { params: { slug: string } }): Promise<Metadata> {
  const post = await loadPost(params.slug);
  if (!post || post.status !== 'PUBLISHED') {
    return { robots: { index: false, follow: false } };
  }

  return pageMetadata({
    locale: defaultLocale,
    path: `/news/${post.slug}`,
    title: `${post.seoTitle ?? post.title} | آلمانیار`,
    description: post.metaDescription ?? post.excerpt ?? post.title,
    image: post.coverImageUrl ?? undefined,
    type: 'article',
  });
}

export default async function NewsPostPage({
  params,
}: { params: { slug: string } }) {
  const locale: Locale = defaultLocale;
  const post = await loadPost(params.slug);
  if (!post || post.status !== 'PUBLISHED') notFound();

  const datePublished = post.publishedAt?.toISOString().slice(0, 10);
  const dateModified = post.updatedAt.toISOString().slice(0, 10);

  const jsonLd = [
    breadcrumbLd([
      { name: 'خانه', url: localizedUrl(locale) },
      { name: 'اخبار', url: localizedUrl(locale, '/news') },
      { name: post.category.name, url: localizedUrl(locale, `/news/category/${post.category.slug}`) },
      { name: post.title, url: localizedUrl(locale, `/news/${post.slug}`) },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.metaDescription ?? post.excerpt ?? post.title,
      inLanguage: 'fa',
      datePublished,
      dateModified,
      image: post.coverImageUrl
        ? `${SITE.url}${post.coverImageUrl}`
        : `${SITE.url}/og.png`,
      mainEntityOfPage: `${SITE.url}/fa/news/${post.slug}`,
      author: { '@id': `${SITE.url}/#person` },
      publisher: { '@id': `${SITE.url}/#person` },
      articleSection: post.category.name,
      keywords: post.tags.map((t) => t.tag.name).join(', ') || undefined,
    },
    // Also emit the existing Article LD for consistency with topic pages.
    articleLd({
      locale,
      path: `/news/${post.slug}`,
      headline: post.title,
      description: post.metaDescription ?? post.excerpt ?? post.title,
      image: post.coverImageUrl ?? undefined,
      datePublished,
      dateModified,
    }),
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <JsonLd data={jsonLd} />

      <PageHero
        locale={locale}
        eyebrow={post.category.name}
        title={post.title}
        subtitle={post.excerpt ?? undefined}
        updatedAt={datePublished}
        breadcrumbs={[
          { label: 'خانه', href: '/fa' },
          { label: 'اخبار', href: '/fa/news' },
          { label: post.category.name, href: `/fa/news/category/${post.category.slug}` },
          { label: post.title },
        ]}
      />

      <main className="container mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {post.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImageUrl}
            alt={post.coverImageAlt ?? post.title}
            className="mb-8 w-full rounded-2xl object-cover shadow-soft"
          />
        )}

        <article
          className="prose prose-slate max-w-none rounded-2xl border border-slate-200/80 bg-white p-8 leading-8 shadow-soft md:p-10"
          dir="rtl"
          // bodyHtml is produced by TipTap (or the legacy plain-text helper);
          // TipTap's serializer is safe-by-construction.
          dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
        />

        {post.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-500">برچسب‌ها:</span>
            {post.tags.map(({ tag }) => (
              <span
                key={tag.slug}
                className="rounded-full bg-slate-100 px-3 py-1 text-slate-700"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="mt-10 flex items-center justify-between text-sm">
          <Link href="/fa/news" className="text-emerald-700 hover:underline">
            ← همه‌ی اخبار
          </Link>
          <span className="text-slate-400" dir="ltr">
            {datePublished && formatJalali(datePublished)}
          </span>
        </div>

        {/* Phase-8E — related news, scored by same-category + shared tags. */}
        <RelatedNews
          categorySlug={post.category.slug}
          excludeSlug={post.slug}
          tagSlugs={post.tags.map((t) => t.tag.slug)}
        />
      </main>
    </div>
  );
}
