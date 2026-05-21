import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { deleteFile } from '@/lib/storage';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireUser();
  if (guard.error) return guard.error;

  const isAdmin = guard.session.user.role === 'ADMIN';
  const doc = await prisma.document.findUnique({ where: { id: params.id } });

  if (!doc) return NextResponse.json({ error: 'یافت نشد' }, { status: 404 });
  if (!isAdmin && doc.userId !== guard.session.user.id) {
    return NextResponse.json({ error: 'دسترسی ندارید' }, { status: 403 });
  }
  // Users can only delete their own PENDING documents; admins can delete any.
  if (!isAdmin && doc.status !== 'PENDING') {
    return NextResponse.json({ error: 'مدارک بررسی‌شده قابل حذف نیستند' }, { status: 400 });
  }

  await deleteFile(doc.storedName);
  await prisma.document.delete({ where: { id: doc.id } });

  return NextResponse.json({ ok: true });
}
