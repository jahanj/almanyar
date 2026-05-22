import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { notifyAdminNewContact } from '@/lib/mailer';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { ConsentInputSchema, consentDbFields, extractClientMeta } from '@/lib/consent';

const ContactSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(30).optional().nullable(),
  subject: z.string().max(200).optional().nullable(),
  message: z.string().min(10).max(5000),
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
  website: z.string().optional(), // honeypot — must stay empty
  consent: ConsentInputSchema.optional(),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`contact:${ip}`, 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'تعداد درخواست‌ها زیاد است. کمی صبر کنید.' },
      { status: 429 }
    );
  }

  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const parsed = ContactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Honeypot: pretend success without storing if a bot filled the hidden field.
    if (parsed.data.website && parsed.data.website.trim() !== '') {
      return NextResponse.json({ message: 'درخواست شما با موفقیت ثبت شد.' }, { status: 201 });
    }

    if (!parsed.data.consent?.termsAccepted) {
      return NextResponse.json(
        { error: 'برای ارسال فرم، موافقت با حریم خصوصی و سلب مسئولیت لازم است.' },
        { status: 400 }
      );
    }

    const { website: _hp, consent, ...contactData } = parsed.data;
    const consentMeta = extractClientMeta(req.headers);
    const request = await prisma.contactRequest.create({
      data: {
        ...contactData,
        userId: session?.user?.id ?? null,
        ...consentDbFields(consent, consentMeta),
      },
      select: { id: true, createdAt: true },
    });

    notifyAdminNewContact(parsed.data).catch((err) =>
      console.error('admin notification failed', err)
    );

    return NextResponse.json(
      { request, message: 'درخواست شما با موفقیت ثبت شد. به زودی با شما تماس می‌گیریم.' },
      { status: 201 }
    );
  } catch (err) {
    console.error('contact create error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
