import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';

/**
 * Phase-8B — categories feed for the admin post editor's <select>.
 * Phase 8 doesn't ship category CRUD UI; the 6 seeded categories cover
 * the brief. A future phase can add admin-side category management.
 */
export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const categories = await prisma.postCategory.findMany({
    orderBy: { order: 'asc' },
    select: { id: true, slug: true, name: true, order: true },
  });
  return NextResponse.json({ categories });
}
