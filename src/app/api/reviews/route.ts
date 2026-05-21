import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

const ReviewSchema = z.object({
  authorName: z.string().min(2).max(80),
  authorEmail: z.string().email().optional().nullable(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional().nullable(),
  content: z.string().min(10).max(2000),
  serviceType: z
    .enum([
      'STUDENT_RESIDENCE',
      'HOUSING',
      'UNIVERSITY_SELECTION',
      'AUSBILDUNG',
      'TURKEY_RESIDENCE',
      'OTHER',
    ])
    .optional()
    .nullable(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get('limit') ?? 20), 50);
  const page = Math.max(Number(searchParams.get('page') ?? 1), 1);

  const [reviews, total, agg] = await Promise.all([
    prisma.review.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
      select: {
        id: true,
        authorName: true,
        rating: true,
        title: true,
        content: true,
        serviceType: true,
        createdAt: true,
      },
    }),
    prisma.review.count({ where: { status: 'APPROVED' } }),
    prisma.review.aggregate({
      where: { status: 'APPROVED' },
      _avg: { rating: true },
      _count: true,
    }),
  ]);

  return NextResponse.json({
    reviews,
    total,
    page,
    limit,
    averageRating: agg._avg.rating ?? 0,
    totalApproved: agg._count,
  });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`reviews:${ip}`, 3, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'تعداد درخواست‌ها زیاد است. کمی صبر کنید.' },
      { status: 429 }
    );
  }

  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const parsed = ReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        ...parsed.data,
        userId: session?.user?.id ?? null,
        status: 'PENDING',
      },
      select: { id: true, status: true },
    });

    return NextResponse.json(
      { review, message: 'نظر شما ثبت شد و پس از تایید نمایش داده می‌شود.' },
      { status: 201 }
    );
  } catch (err) {
    console.error('review create error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
