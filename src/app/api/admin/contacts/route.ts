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

  const where = status && ['NEW', 'IN_PROGRESS', 'ANSWERED', 'ARCHIVED'].includes(status)
    ? { status: status as 'NEW' | 'IN_PROGRESS' | 'ANSWERED' | 'ARCHIVED' }
    : {};

  const [requests, total] = await Promise.all([
    prisma.contactRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.contactRequest.count({ where }),
  ]);

  return NextResponse.json({ requests, total, page, limit });
}
