import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';
import { TOPICS, GROUP_STYLE } from '@/lib/germany-topics';

/**
 * Phase-8G — list of all internal link targets, for the editor's
 * "insert internal link" picker.
 *
 * Combines:
 *   - every published Post (DB)
 *   - every Topic (static registry in lib/germany-topics)
 *   - the curated hub pages explicitly under /fa/
 *
 * Sorted by type then title so the picker is browsable without
 * search. List is small enough (~50 entries today) that we don't
 * need pagination or full-text indexing.
 */

interface LinkTarget {
  type: 'post' | 'topic' | 'page';
  title: string;
  href: string;
  label?: string;
}

const STATIC_PAGES: LinkTarget[] = [
  { type: 'page', title: 'صفحه‌ی اصلی',              href: '/fa' },
  { type: 'page', title: 'درباره‌ی آلمانیار',         href: '/fa/about' },
  { type: 'page', title: 'نحوه‌ی کار آلمانیار',       href: '/fa/how-it-works' },
  { type: 'page', title: 'اقامت تحصیلی ترکیه',       href: '/fa/turkey-residence' },
  { type: 'page', title: 'هزینه‌های زندگی در ترکیه', href: '/fa/turkey-costs' },
  { type: 'page', title: 'ویزای آلمان از ترکیه',      href: '/fa/germany-visa-from-turkey' },
  { type: 'page', title: 'فرم ارزیابی رایگان',        href: '/fa/evaluation' },
  { type: 'page', title: 'سیاست حریم خصوصی',          href: '/fa/privacy' },
  { type: 'page', title: 'سلب مسئولیت',               href: '/fa/disclaimer' },
];

export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: [{ publishedAt: 'desc' }],
    select: {
      slug: true, title: true,
      category: { select: { name: true } },
    },
  });

  const postTargets: LinkTarget[] = posts.map((p) => ({
    type: 'post',
    title: p.title,
    href: `/fa/news/${p.slug}`,
    label: `اخبار · ${p.category.name}`,
  }));

  const topicTargets: LinkTarget[] = TOPICS.map((t) => ({
    type: 'topic',
    title: t.title,
    href: `/fa${t.href}`,
    label: `راهنما · ${GROUP_STYLE[t.group].label}`,
  }));

  // Order: posts first (newest), then static pages, then topics (alpha-ish).
  topicTargets.sort((a, b) => a.title.localeCompare(b.title, 'fa'));

  return NextResponse.json({
    targets: [...postTargets, ...STATIC_PAGES, ...topicTargets],
  });
}
