/**
 * /api/stats — homepage hero stat values.
 *
 *  GET  : public, returns the merged SiteStatsView (nullable fields when unset).
 *  PATCH: admin-only, accepts a partial SiteStats payload. Fields omitted are
 *         left unchanged; fields set to `null` are cleared back to "unset".
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { loadSiteStats } from '@/lib/site-stats';
import { requireAdmin } from '@/lib/admin-guard';

export async function GET() {
  const stats = await loadSiteStats();
  return NextResponse.json(stats);
}

const PatchSchema = z.object({
  studentsCount:       z.number().int().nonnegative().nullable().optional(),
  partnerUniversities: z.number().int().nonnegative().nullable().optional(),
  successRate:         z.number().int().min(0).max(100).nullable().optional(),
  yearsExperience:     z.number().int().nonnegative().nullable().optional(),
  averageRating:       z.number().min(0).max(5).nullable().optional(),
  reviewsCount:        z.number().int().nonnegative().nullable().optional(),
});

export async function PATCH(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const parsed = PatchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid payload', issues: parsed.error.issues }, { status: 400 });
  }

  await prisma.siteStats.upsert({
    where: { id: 1 },
    create: { id: 1, ...parsed.data },
    update: parsed.data,
  });

  return NextResponse.json(await loadSiteStats());
}
