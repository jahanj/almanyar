import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';
import { notifyStudentTaskAdminTicked, notifyStudentTaskBlocked } from '@/lib/notify';

/**
 * Phase-5 TASK-03 — admin edit / delete a single Task.
 *
 * PATCH /api/admin/tasks/[id]
 *   - Edits any subset of: title, description, category, status,
 *     requiredDocCategory, dueDate, adminTicked.
 *   - `adminTicked` is the canonical DONE signal (PHASE-5-PLAN §2.2):
 *     when toggled true, status flips to DONE and adminTickedAt/By are
 *     stamped. When toggled false, status falls back to whatever the
 *     admin set explicitly in this PATCH, or PENDING if they didn't.
 *
 * DELETE /api/admin/tasks/[id]
 *   - Hard delete. Cascade isn't an issue (no children).
 */

const Patch = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).nullable().optional(),
  category: z.enum([
    'UNIVERSITY_REGISTRATION', 'RESIDENCE_PERMIT', 'HEALTH_INSURANCE',
    'BANK_ACCOUNT', 'SPERRKONTO', 'MONEY_TRANSFER', 'DOCUMENT_TRANSLATION',
    'EMBASSY_APPOINTMENT', 'OTHER',
  ]).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE', 'BLOCKED']).optional(),
  requiredDocCategory: z.enum([
    'PASSPORT', 'DIPLOMA', 'TRANSCRIPT', 'LANGUAGE_CERTIFICATE', 'PHOTO',
    'FINANCIAL_PROOF', 'RESUME', 'MOTIVATION_LETTER', 'ACCEPTANCE_LETTER',
    'INSURANCE', 'OTHER',
  ]).nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  adminTicked: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const parsed = Patch.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const existing = await prisma.task.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      adminTicked: true,
      status: true,
      title: true,
      application: {
        select: {
          id: true,
          title: true,
          user: { select: { id: true, email: true } },
        },
      },
    },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) data.title = parsed.data.title;
  if (parsed.data.description !== undefined) data.description = parsed.data.description;
  if (parsed.data.category !== undefined) data.category = parsed.data.category;
  if (parsed.data.requiredDocCategory !== undefined) data.requiredDocCategory = parsed.data.requiredDocCategory;
  if (parsed.data.dueDate !== undefined) {
    data.dueDate = parsed.data.dueDate ? new Date(parsed.data.dueDate) : null;
  }
  if (parsed.data.status !== undefined) data.status = parsed.data.status;

  // adminTicked is the load-bearing field — synchronise status with it
  // unless the caller also passed an explicit status (which wins).
  if (parsed.data.adminTicked !== undefined && parsed.data.adminTicked !== existing.adminTicked) {
    if (parsed.data.adminTicked) {
      data.adminTicked = true;
      data.adminTickedAt = new Date();
      data.adminTickedById = guard.session.user.id;
      if (parsed.data.status === undefined) data.status = 'DONE';
    } else {
      data.adminTicked = false;
      data.adminTickedAt = null;
      data.adminTickedById = null;
      if (parsed.data.status === undefined) data.status = 'PENDING';
    }
  }

  const task = await prisma.task.update({
    where: { id: params.id },
    data,
  });

  // Fire notifications on meaningful transitions only. Cap is enforced
  // inside lib/notify (5 / kind / case / 24h) so the loop above doesn't
  // need its own throttling.
  const becameTicked = parsed.data.adminTicked === true && !existing.adminTicked;
  const becameBlocked = parsed.data.status === 'BLOCKED' && existing.status !== 'BLOCKED';

  if (becameTicked) {
    await notifyStudentTaskAdminTicked({
      userId: existing.application.user.id,
      userEmail: existing.application.user.email,
      applicationId: existing.application.id,
      applicationTitle: existing.application.title,
      taskTitle: task.title,
    });
  } else if (becameBlocked) {
    await notifyStudentTaskBlocked({
      userId: existing.application.user.id,
      userEmail: existing.application.user.email,
      applicationId: existing.application.id,
      applicationTitle: existing.application.title,
      taskTitle: task.title,
    });
  }

  return NextResponse.json({ task });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const existing = await prisma.task.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  await prisma.task.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
