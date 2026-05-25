import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';
import { slugify } from '@/lib/slugify';
import { plainTextToHtml } from '@/lib/post-html';

/**
 * Phase-8B — admin Post CRUD: list + create.
 *
 * - GET: paginated list (admin sees DRAFT + PUBLISHED + ARCHIVED).
 *   Public surface filters to PUBLISHED only — that lives in 8D.
 * - POST: create. Slug auto-derived from title if not provided.
 *   bodyHtml is plain-text-to-HTML for now; the TipTap editor in 8C
 *   will replace this path with TipTap's HTML output.
 */

const CreateSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().max(120).optional(),
  categoryId: z.string().min(1),
  excerpt: z.string().max(300).optional().nullable(),
  body: z.string().max(50_000).default(''),
  seoTitle: z.string().max(200).optional().nullable(),
  metaDescription: z.string().max(300).optional().nullable(),
  coverImageUrl: z.string().max(500).optional().nullable(),
  coverImageAlt: z.string().max(200).optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  tagSlugs: z.array(z.string().min(1).max(60)).optional(),
});

export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const limit = Math.min(Number(searchParams.get('limit') ?? 30), 100);
  const page = Math.max(Number(searchParams.get('page') ?? 1), 1);

  const where = status && ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status)
    ? { status: status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' }
    : {};

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      skip: (page - 1) * limit,
      select: {
        id: true, slug: true, title: true, status: true,
        publishedAt: true, createdAt: true, updatedAt: true,
        coverImageUrl: true,
        category: { select: { slug: true, name: true } },
        tags: { select: { tag: { select: { slug: true, name: true } } } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return NextResponse.json({ posts, total, page, limit });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const parsed = CreateSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 });
  }
  const data = parsed.data;

  const baseSlug = (data.slug?.trim() ? data.slug : slugify(data.title)).slice(0, 120);
  if (!baseSlug) {
    return NextResponse.json({ error: 'Slug invalid' }, { status: 400 });
  }

  const slug = await uniqueSlug(baseSlug);

  // Category must exist (RESTRICTed FK would error anyway; surface a
  // friendlier 400 if it doesn't).
  const category = await prisma.postCategory.findUnique({ where: { id: data.categoryId } });
  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 400 });
  }

  // Tag upserts (per slug). Frontend can send free-form tag slugs;
  // we create any missing ones with the slug as a default display name.
  const tagConnect = await ensureTags(data.tagSlugs ?? []);

  const post = await prisma.post.create({
    data: {
      slug,
      title: data.title,
      seoTitle: data.seoTitle ?? null,
      metaDescription: data.metaDescription ?? null,
      excerpt: data.excerpt ?? null,
      bodyHtml: plainTextToHtml(data.body),
      // bodyJson is left unset for plain-text-authored posts in 8B;
      // Phase 8C will populate it from TipTap's JSON serializer.
      coverImageUrl: data.coverImageUrl ?? null,
      coverImageAlt: data.coverImageAlt ?? null,
      status: data.status,
      publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      categoryId: data.categoryId,
      authorId: guard.session.user.id,
      tags: tagConnect.length
        ? { create: tagConnect.map((tagId) => ({ tagId })) }
        : undefined,
    },
    select: { id: true, slug: true, status: true },
  });

  return NextResponse.json({ post }, { status: 201 });
}

async function uniqueSlug(base: string): Promise<string> {
  // Suffix `-2`, `-3`, … until free. Bound it so we don't loop forever.
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const existing = await prisma.post.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing) return candidate;
  }
  // Fallback: append a short random suffix.
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

async function ensureTags(slugs: string[]): Promise<string[]> {
  if (!slugs.length) return [];
  const normalised = Array.from(new Set(slugs.map((s) => slugify(s)).filter(Boolean)));
  const existing = await prisma.postTag.findMany({
    where: { slug: { in: normalised } },
    select: { id: true, slug: true },
  });
  const missing = normalised.filter((s) => !existing.some((e) => e.slug === s));
  const created = await Promise.all(
    missing.map((s) => prisma.postTag.create({ data: { slug: s, name: s } })),
  );
  return [...existing.map((e) => e.id), ...created.map((c) => c.id)];
}
