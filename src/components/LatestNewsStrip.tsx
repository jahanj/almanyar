import Link from 'next/link';
import PostCard, { type PostCardData } from './news/PostCard';

/**
 * Phase-8F — homepage "latest from the blog" strip.
 *
 * Pure presentational; the page loader fetches the 3 most recent
 * PUBLISHED posts and passes them down. If the list is empty (no
 * posts yet), the strip renders nothing so a freshly-deployed site
 * doesn't show an empty section.
 */

export default function LatestNewsStrip({ posts }: { posts: PostCardData[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="bg-white py-16 md:py-20" dir="rtl" aria-labelledby="latest-news-title">
      <div className="container mx-auto px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
              تازه‌ها
            </span>
            <h2 id="latest-news-title" className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">
              آخرین خبرها و راهنماها
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              تازه‌ترین تحلیل‌ها و به‌روزرسانی‌ها از تیم آلمانیار.
            </p>
          </div>
          <Link
            href="/fa/news"
            className="text-sm font-medium text-emerald-700 hover:underline"
          >
            مشاهده‌ی همه‌ی اخبار ←
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
