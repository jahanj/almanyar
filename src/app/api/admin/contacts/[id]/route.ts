import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';

const PatchSchema = z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'ANSWERED', 'ARCHIVED']).optional(),
  adminNotes: z.string().max(5000).nullable().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const request = await prisma.contactRequest.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return NextResponse.json({ request });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  await prisma.contactRequest.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
