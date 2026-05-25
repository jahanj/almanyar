import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';
import { slugify } from '@/lib/slugify';
import { plainTextToHtml } from '@/lib/post-html';

/**
 * Phase-8B — GET / PATCH / DELETE for a single post.
 *
 * PATCH semantics:
 *  - Any subset of fields can land.
 *  - Body re-renders bodyHtml from plain text in this phase; 8C will
 *    swap the path to TipTap-generated HTML.
 *  - First DRAFT→PUBLISHED stamps publishedAt; subsequent toggles
 *    DON'T clear it (re-publishing preserves SEO date authority).
 *  - tagSlugs is full-replacement when present, untouched when omitted.
 */

const PatchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().max(120).optional(),
  categoryId: z.string().min(1).optional(),
  excerpt: z.string().max(300).nullable().optional(),
  body: z.string().max(50_000).optional(),
  seoTitle: z.string().max(200).nullable().optional(),
  metaDescription: z.string().max(300).nullable().optional(),
  coverImageUrl: z.string().max(500).nullable().optional(),
  coverImageAlt: z.string().max(200).nullable().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  tagSlugs: z.array(z.string().min(1).max(60)).optional(),
});

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      category: { select: { id: true, slug: true, name: true } },
      tags: { select: { tag: { select: { slug: true, name: true } } } },
    },
  });
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    post: {
      ...post,
      tagSlugs: post.tags.map((t) => t.tag.slug),
    },
  });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const existing = await prisma.post.findUnique({
    where: { id: params.id },
    select: { id: true, slug: true, status: true, publishedAt: true },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const parsed = PatchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const data = parsed.data;

  const update: Record<string, unknown> = {};
  if (data.title !== undefined) update.title = data.title;

  if (data.slug !== undefined) {
    const next = slugify(data.slug);
    if (!next) return NextResponse.json({ error: 'Slug invalid' }, { status: 400 });
    if (next !== existing.slug) {
      const clash = await prisma.post.findUnique({ where: { slug: next }, select: { id: true } });
      if (clash) return NextResponse.json({ error: 'Slug already taken' }, { status: 409 });
      update.slug = next;
    }
  }

  if (data.categoryId !== undefined) {
    const cat = await prisma.postCategory.findUnique({ where: { id: data.categoryId } });
    if (!cat) return NextResponse.json({ error: 'Category not found' }, { status: 400 });
    update.categoryId = data.categoryId;
  }

  if (data.excerpt !== undefined) update.excerpt = data.excerpt;
  if (data.body !== undefined) update.bodyHtml = plainTextToHtml(data.body);
  if (data.seoTitle !== undefined) update.seoTitle = data.seoTitle;
  if (data.metaDescription !== undefined) update.metaDescription = data.metaDescription;
  if (data.coverImageUrl !== undefined) update.coverImageUrl = data.coverImageUrl;
  if (data.coverImageAlt !== undefined) update.coverImageAlt = data.coverImageAlt;

  if (data.status !== undefined) {
    update.status = data.status;
    // Stamp publishedAt on the first DRAFT→PUBLISHED transition only.
    if (data.status === 'PUBLISHED' && !existing.publishedAt) {
      update.publishedAt = new Date();
    }
  }

  // Tags: full-replacement semantics. Delete old links, ensure tags exist,
  // re-link. Done in a transaction so the post is never half-tagged.
  if (data.tagSlugs !== undefined) {
    const tagIds = await ensureTags(data.tagSlugs);
    await prisma.$transaction([
      prisma.postsOnTags.deleteMany({ where: { postId: params.id } }),
      ...(tagIds.length
        ? [prisma.postsOnTags.createMany({ data: tagIds.map((tagId) => ({ postId: params.id, tagId })) })]
        : []),
    ]);
  }

  const post = await prisma.post.update({
    where: { id: params.id },
    data: update,
    select: { id: true, slug: true, status: true, publishedAt: true },
  });

  return NextResponse.json({ post });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const existing = await prisma.post.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // PostsOnTags cascades from Post per the migration; nothing else to clean up.
  await prisma.post.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
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
