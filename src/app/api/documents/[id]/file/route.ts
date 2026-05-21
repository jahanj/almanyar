import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { readFile } from '@/lib/storage';

/** Authenticated file download. Only the owner or an admin may fetch a file. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireUser();
  if (guard.error) return guard.error;

  const doc = await prisma.document.findUnique({ where: { id: params.id } });
  if (!doc) return NextResponse.json({ error: 'یافت نشد' }, { status: 404 });

  const isAdmin = guard.session.user.role === 'ADMIN';
  if (!isAdmin && doc.userId !== guard.session.user.id) {
    return NextResponse.json({ error: 'دسترسی ندارید' }, { status: 403 });
  }

  try {
    const data = await readFile(doc.storedName);
    return new NextResponse(data as unknown as BodyInit, {
      headers: {
        'Content-Type': doc.mimeType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(doc.originalName)}"`,
        'Content-Length': String(doc.size),
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return NextResponse.json({ error: 'فایل در دسترس نیست' }, { status: 404 });
  }
}
