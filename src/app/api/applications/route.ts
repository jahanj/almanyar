import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser, requireVerifiedUser } from '@/lib/session';

const CreateSchema = z.object({
  type: z.enum(['STUDENT_GERMANY', 'STUDENT_TURKEY', 'AUSBILDUNG', 'OTHER']),
  title: z.string().min(2).max(150),
});

export async function GET() {
  const guard = await requireUser();
  if (guard.error) return guard.error;

  const applications = await prisma.application.findMany({
    where: { userId: guard.session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      documents: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, category: true, status: true, originalName: true,
          mimeType: true, size: true, reviewNote: true, createdAt: true,
        },
      },
    },
  });

  return NextResponse.json({ applications });
}

export async function POST(req: Request) {
  const guard = await requireVerifiedUser();
  if (guard.error) return guard.error;

  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'اطلاعات نامعتبر است' }, { status: 400 });
  }

  // Limit number of open cases per user to prevent abuse.
  const count = await prisma.application.count({ where: { userId: guard.session.user.id } });
  if (count >= 10) {
    return NextResponse.json({ error: 'حداکثر تعداد پرونده‌ها ثبت شده است' }, { status: 400 });
  }

  const application = await prisma.application.create({
    data: {
      userId: guard.session.user.id,
      type: parsed.data.type,
      title: parsed.data.title,
      status: 'SUBMITTED',
    },
  });

  return NextResponse.json({ application }, { status: 201 });
}
