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

  const valid = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_REQUESTED', 'APPROVED', 'REJECTED', 'COMPLETED'];
  const where = status && valid.includes(status) ? { status: status as never } : {};

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        documents: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true, category: true, status: true, originalName: true,
            mimeType: true, size: true, reviewNote: true, createdAt: true,
          },
        },
        // Phase-5 — admin panel needs the roadmap to render AdminTaskEditor.
        tasks: {
          orderBy: { order: 'asc' },
          select: {
            id: true, order: true, title: true, description: true,
            category: true, status: true, requiredDocCategory: true,
            studentTicked: true, studentTickedAt: true,
            adminTicked: true, adminTickedAt: true,
            dueDate: true, createdAt: true, updatedAt: true,
          },
        },
      },
    }),
    prisma.application.count({ where }),
  ]);

  return NextResponse.json({ applications, total, page, limit });
}
