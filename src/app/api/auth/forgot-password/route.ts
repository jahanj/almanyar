import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createToken, appUrl } from '@/lib/tokens';
import { sendMail } from '@/lib/mailer';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

const Schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`forgot:${ip}`, 5, 60_000);
  if (!rl.ok) return NextResponse.json({ error: 'تعداد درخواست‌ها زیاد است.' }, { status: 429 });

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  // Always return success to avoid leaking which emails are registered.
  if (!parsed.success) {
    return NextResponse.json({ message: 'اگر این ایمیل ثبت شده باشد، لینک بازیابی ارسال شد.' });
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true } });

  if (user) {
    try {
      const token = await createToken(email, 'PASSWORD_RESET');
      const link = appUrl(`/reset-password?token=${token}`);
      await sendMail({
        to: email,
        subject: 'بازیابی رمز عبور — مهاجرت آلمان',
        html: `<div dir="rtl" style="font-family:Tahoma,Arial;line-height:1.8">
          <h2>بازیابی رمز عبور</h2>
          <p>برای تعیین رمز عبور جدید روی لینک زیر کلیک کنید (تا ۱ ساعت معتبر است):</p>
          <p><a href="${link}">${link}</a></p>
          <p>اگر شما این درخواست را نداده‌اید، این ایمیل را نادیده بگیرید.</p>
        </div>`,
      });
    } catch (e) {
      console.error('reset email failed', e);
    }
  }

  return NextResponse.json({ message: 'اگر این ایمیل ثبت شده باشد، لینک بازیابی ارسال شد.' });
}
