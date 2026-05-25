import Link from 'next/link';
import { formatJalali } from '@/lib/dates';

/**
 * Phase-8D — single news/article card. Used in:
 *   - /fa/news feed
 *   - /fa/news/category/<slug> feed
 *   - hub-page latest-news strips (8E)
 *   - related-articles block on post pages (8E)
 *   - homepage latest-news strip (8F)
 *
 * Cover image is optional; the fallback is a category-tinted gradient
 * card so feed visuals stay consistent regardless of which posts have
 * a hero image. The gradient palette mirrors the `GROUP_STYLE` map
 * already used by topic-route.tsx so news and topics feel like one
 * visual system.
 */

const CATEGORY_GRADIENT: Record<string, string> = {
  'exams':           'from-amber-500 to-orange-600',
  'germany-visa':    'from-rose-500 to-red-600',
  'study-germany':   'from-blue-500 to-indigo-600',
  'work-germany':    'from-emerald-500 to-teal-600',
  'life-germany':    'from-purple-500 to-fuchsia-600',
  'news-updates':    'from-slate-600 to-slate-800',
};

export interface PostCardData {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  publishedAt: Date | string | null;
  category: { slug: string; name: string };
}

export default function PostCard({ post }: { post: PostCardData }) {
  const href = `/fa/news/${post.slug}`;
  const gradient = CATEGORY_GRADIENT[post.category.slug] ?? CATEGORY_GRADIENT['news-updates']!;
  const dateIso = post.publishedAt
    ? (typeof post.publishedAt === 'string' ? post.publishedAt : post.publishedAt.toISOString()).slice(0, 10)
    : null;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
    >
      <div className={`relative h-44 w-full overflow-hidden bg-gradient-to-br ${gradient}`}>
        {post.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImageUrl}
            alt={post.coverImageAlt ?? post.title}
            className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/85 text-2xl font-bold">
            {post.category.name}
          </div>
        )}
        <div className="absolute top-3 start-3">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 backdrop-blur">
            {post.category.name}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug text-slate-900 group-hover:text-emerald-700">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 text-sm leading-7 text-slate-600 line-clamp-3">
            {post.excerpt}
          </p>
        )}
        {dateIso && (
          <p className="mt-3 text-xs text-slate-400">
            {formatJalali(dateIso)}
          </p>
        )}
      </div>
    </Link>
  );
}
