import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';
import { notifyStudentTaskAdded } from '@/lib/notify';

/**
 * Phase-5 TASK-03 — admin creates a Task on an Application.
 *
 * POST /api/admin/applications/[id]/tasks
 * Body: { title, description?, category?, requiredDocCategory?, dueDate? }
 *
 * `order` is auto-assigned (max+1) so admins don't have to think about
 * positions on first insert; AdminTaskEditor (TASK-06) calls the reorder
 * endpoint when the admin drags rows around.
 */

const Body = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional().nullable(),
  category: z.enum([
    'UNIVERSITY_REGISTRATION', 'RESIDENCE_PERMIT', 'HEALTH_INSURANCE',
    'BANK_ACCOUNT', 'SPERRKONTO', 'MONEY_TRANSFER', 'DOCUMENT_TRANSLATION',
    'EMBASSY_APPOINTMENT', 'OTHER',
  ]).optional(),
  requiredDocCategory: z.enum([
    'PASSPORT', 'DIPLOMA', 'TRANSCRIPT', 'LANGUAGE_CERTIFICATE', 'PHOTO',
    'FINANCIAL_PROOF', 'RESUME', 'MOTIVATION_LETTER', 'ACCEPTANCE_LETTER',
    'INSURANCE', 'OTHER',
  ]).optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const application = await prisma.application.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      user: { select: { id: true, email: true } },
    },
  });
  if (!application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  const last = await prisma.task.findFirst({
    where: { applicationId: params.id },
    orderBy: { order: 'desc' },
    select: { order: true },
  });
  const nextOrder = (last?.order ?? -1) + 1;

  const task = await prisma.task.create({
    data: {
      applicationId: params.id,
      order: nextOrder,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      category: parsed.data.category ?? 'OTHER',
      requiredDocCategory: parsed.data.requiredDocCategory ?? null,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    },
  });

  await notifyStudentTaskAdded({
    userId: application.user.id,
    userEmail: application.user.email,
    applicationId: application.id,
    applicationTitle: application.title,
    taskTitle: task.title,
  });

  return NextResponse.json({ task }, { status: 201 });
}
