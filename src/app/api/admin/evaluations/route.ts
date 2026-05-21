import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';

export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const limit = Math.min(Number(searchParams.get('limit') ?? 50), 100);
  const page = Math.max(Number(searchParams.get('page') ?? 1), 1);

  const where = status && ['NEW', 'REVIEWING', 'CONTACTED', 'CLOSED'].includes(status)
    ? { status: status as 'NEW' | 'REVIEWING' | 'CONTACTED' | 'CLOSED' }
    : {};

  const [evaluations, total] = await Promise.all([
    prisma.evaluation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.evaluation.count({ where }),
  ]);

  return NextResponse.json({ evaluations, total, page, limit });
}
