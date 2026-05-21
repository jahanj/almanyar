import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { consumeToken } from '@/lib/tokens';

const Schema = z.object({
  token: z.string().min(10).max(200),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'اطلاعات نامعتبر است' }, { status: 400 });

  const email = await consumeToken(parsed.data.token, 'PASSWORD_RESET');
  if (!email) return NextResponse.json({ error: 'لینک نامعتبر یا منقضی شده است' }, { status: 400 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.update({
    where: { email },
    data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
  });

  return NextResponse.json({ message: 'رمز عبور با موفقیت تغییر کرد. اکنون وارد شوید.' });
}
