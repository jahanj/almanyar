import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/tokens';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

const Schema = z.object({ email: z.string().email() });

const GENERIC = 'اگر این ایمیل ثبت شده و تایید نشده باشد، لینک تایید دوباره ارسال شد.';

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`resend-verify:${ip}`, 3, 60_000);
  if (!rl.ok) return NextResponse.json({ error: 'تعداد درخواست‌ها زیاد است. کمی صبر کنید.' }, { status: 429 });

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  // Always return success to avoid leaking which emails are registered.
  if (!parsed.success) return NextResponse.json({ message: GENERIC });

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { name: true, emailVerified: true },
  });

  if (user && !user.emailVerified) {
    try {
      await sendVerificationEmail(email, user.name);
    } catch (e) {
      console.error('resend verification email failed', e);
    }
  }

  return NextResponse.json({ message: GENERIC });
}
