import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { consumeToken } from '@/lib/tokens';

const Schema = z.object({ token: z.string().min(10).max(200) });

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'توکن نامعتبر است' }, { status: 400 });

  const email = await consumeToken(parsed.data.token, 'EMAIL_VERIFICATION');
  if (!email) return NextResponse.json({ error: 'لینک نامعتبر یا منقضی شده است' }, { status: 400 });

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  }).catch(() => {});

  return NextResponse.json({ message: 'ایمیل شما با موفقیت تایید شد' });
}
