import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';

/**
 * Phase-5 TASK-02 — student "I did it" tick.
 *
 * POST /api/applications/[id]/tasks/[taskId]/student-tick
 * Body: { done: boolean }
 *
 * Per PHASE-5-PLAN §2.2, this is INFORMATIONAL only — it does NOT
 * flip Task.status. Admin still has to mark adminTicked to land on
 * status=DONE. The student tick:
 *   - Sets studentTicked / studentTickedAt / studentTickedById
 *   - On true→true (idempotent): no notification
 *   - On false→true: triggers an admin-facing notification (TASK-04
 *     wires the actual notify call once that lib lands)
 *
 * Validates that the Task belongs to an Application owned by the
 * caller. 404 (not 403) on cross-user access to avoid leaking
 * existence.
 */

const Body = z.object({
  done: z.boolean(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string; taskId: string } },
) {
  const guard = await requireUser();
  if (guard.error) return guard.error;

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const task = await prisma.task.findFirst({
    where: {
      id: params.taskId,
      applicationId: params.id,
      application: { userId: guard.session.user.id },
    },
    select: { id: true, studentTicked: true },
  });

  if (!task) {
    return NextResponse.json({ error: 'گام یافت نشد' }, { status: 404 });
  }

  // Idempotent: no-op if state already matches.
  if (task.studentTicked === parsed.data.done) {
    return NextResponse.json({ ok: true, unchanged: true });
  }

  const updated = await prisma.task.update({
    where: { id: task.id },
    data: parsed.data.done
      ? {
          studentTicked: true,
          studentTickedAt: new Date(),
          studentTickedById: guard.session.user.id,
        }
      : {
          studentTicked: false,
          studentTickedAt: null,
          studentTickedById: null,
        },
    select: {
      id: true, studentTicked: true, studentTickedAt: true,
      adminTicked: true, status: true,
    },
  });

  // TASK-04 will hook notification here:
  //   if (parsed.data.done) await notify({ kind: 'task.studentTicked', ... })
  // Today: silent. The admin will see the change on next /admin/applications load.

  return NextResponse.json({ ok: true, task: updated });
}
