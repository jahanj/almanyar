import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { sendVerificationEmail } from '@/lib/tokens';
import { sendMarketingWelcomeEmail } from '@/lib/marketing';

const RegisterSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().transform((v) => v.toLowerCase()),
  password: z.string().min(8).max(128),
  phone: z.string().max(30).optional().nullable(),
  // Phase-4 §5 — explicit opt-in. Defaults to false in zod; the form
  // unchecks the checkbox by default to satisfy GDPR.
  marketingConsent: z.boolean().optional(),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`register:${ip}`, 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'تعداد درخواست‌ها زیاد است. کمی صبر کنید.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'این ایمیل قبلاً ثبت شده است' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const optIn = parsed.data.marketingConsent === true;

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        passwordHash,
        marketingConsent: optIn,
        marketingConsentAt: optIn ? new Date() : null,
      },
      select: { id: true, email: true, name: true },
    });

    // Fire email verification (best-effort; does not block registration).
    try {
      await sendVerificationEmail(user.email, user.name);
    } catch (e) {
      console.error('verification email failed', e);
    }

    // Phase-4 §5 — separate one-time welcome email confirming the
    // newsletter subscription. Only fires when the user explicitly
    // ticked the box. Best-effort; failure does not block registration.
    if (optIn) {
      try {
        await sendMarketingWelcomeEmail(user);
      } catch (e) {
        console.error('marketing welcome email failed', e);
      }
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error('register error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
