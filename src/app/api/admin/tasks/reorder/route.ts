import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';

/**
 * Phase-5 TASK-03 — batch-reorder Tasks within ONE Application.
 *
 * PATCH /api/admin/tasks/reorder
 * Body: { applicationId, items: [{ id, order }, ...] }
 *
 * Single-application scope keeps the validation cheap: we check that
 * every id in `items` belongs to the named Application and refuse the
 * whole batch otherwise (no partial reorder). Runs inside a transaction
 * so the timeline is never observed in a half-shuffled state.
 *
 * AdminTaskEditor (TASK-06) sends this after each drag-end (or
 * up/down click) with the freshly computed orders.
 */

const Body = z.object({
  applicationId: z.string().min(1),
  items: z.array(z.object({
    id: z.string().min(1),
    order: z.number().int().nonnegative(),
  })).min(1).max(200),
});

export async function PATCH(req: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const { applicationId, items } = parsed.data;

  const tasks = await prisma.task.findMany({
    where: { applicationId },
    select: { id: true },
  });
  const allowed = new Set(tasks.map((t) => t.id));

  for (const item of items) {
    if (!allowed.has(item.id)) {
      return NextResponse.json(
        { error: 'Task does not belong to this application' },
        { status: 400 },
      );
    }
  }

  await prisma.$transaction(
    items.map((it) =>
      prisma.task.update({
        where: { id: it.id },
        data: { order: it.order },
      }),
    ),
  );

  return NextResponse.json({ ok: true, count: items.length });
}
