import { prisma } from '@/lib/prisma';
import PostCard from './PostCard';

/**
 * Phase-8E — server-rendered "related news" strip.
 *
 * Used:
 *   - bottom of each /fa/news/<slug> post page
 *   - bottom of bespoke pages (turkey-residence, turkey-costs, ...)
 *   - hub pages (8E follow-up)
 *
 * Scoring (deliberately simple — no ML, no embeddings):
 *   1. Same category               +3
 *   2. Per shared tag              +1
 *   3. Recency bonus (last 30d)    +0.5
 *
 * If the algorithm yields fewer than `limit`, we fall back to the
 * most recent PUBLISHED posts in the same category so the slot always
 * fills.
 */

interface Props {
  /** Limit results to one category. Most calls pass a category slug. */
  categorySlug?: string;
  /** Exclude the current post from results (when called on a post page). */
  excludeSlug?: string;
  /** Tag slugs to boost matches against. */
  tagSlugs?: string[];
  /** Max cards to show. Default 4. */
  limit?: number;
  /** Optional override for the heading text. */
  heading?: string;
}

export default async function RelatedNews({
  categorySlug,
  excludeSlug,
  tagSlugs = [],
  limit = 4,
  heading = 'مطالب مرتبط',
}: Props) {
  const category = categorySlug
    ? await prisma.postCategory.findUnique({ where: { slug: categorySlug }, select: { id: true, slug: true, name: true } })
    : null;

  // Pull a generous candidate pool — same category first, then recent.
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const candidates = await prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      slug: excludeSlug ? { not: excludeSlug } : undefined,
      OR: [
        category ? { categoryId: category.id } : {},
        tagSlugs.length ? { tags: { some: { tag: { slug: { in: tagSlugs } } } } } : {},
      ].filter((c) => Object.keys(c).length > 0),
    },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: limit * 4, // pool to rank from
    select: {
      slug: true, title: true, excerpt: true,
      coverImageUrl: true, coverImageAlt: true,
      publishedAt: true, categoryId: true,
      category: { select: { slug: true, name: true } },
      tags: { select: { tagId: true, tag: { select: { slug: true } } } },
    },
  });

  // Score + sort.
  const tagSet = new Set(tagSlugs);
  const scored = candidates.map((c) => {
    let score = 0;
    if (category && c.categoryId === category.id) score += 3;
    score += c.tags.filter((t) => tagSet.has(t.tag.slug)).length;
    if (c.publishedAt && c.publishedAt >= since30d) score += 0.5;
    return { post: c, score };
  });
  scored.sort((a, b) => b.score - a.score);

  // Fallback: if scoring picked fewer than `limit`, top up with the
  // already-fetched candidates in publishedAt order.
  let picked = scored.slice(0, limit).map((s) => s.post);
  if (picked.length < limit) {
    const extras = candidates.filter((c) => !picked.some((p) => p.slug === c.slug));
    picked = [...picked, ...extras].slice(0, limit);
  }

  if (picked.length === 0) return null;

  return (
    <section
      aria-label={heading}
      className="mt-12 border-t border-slate-200 pt-10"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 md:text-2xl">{heading}</h2>
        {category && (
          <a
            href={`/fa/news/category/${category.slug}`}
            className="text-sm text-emerald-700 hover:underline"
          >
            بیشتر در «{category.name}» ←
          </a>
        )}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {picked.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
    </section>
  );
}
