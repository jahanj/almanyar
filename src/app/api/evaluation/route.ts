import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { sendMail } from '@/lib/mailer';
import { ConsentInputSchema, consentDbFields, extractClientMeta } from '@/lib/consent';

const PreferenceSchema = z.object({
  university: z.string().max(150).optional().nullable(),
  field: z.string().max(150).optional().nullable(),
  degree: z.string().max(50).optional().nullable(),
});

const EvaluationSchema = z.object({
  // مشخصات فردی
  fullName: z.string().min(2).max(120),
  gender: z.enum(['MALE', 'FEMALE']).optional().nullable(),
  maritalStatus: z.enum(['SINGLE', 'MARRIED']).optional().nullable(),
  birthDate: z.string().max(20).optional().nullable(),
  militaryStatus: z.string().max(60).optional().nullable(),
  hasChildUnder18: z.boolean().default(false),

  // تماس
  mobile: z.string().min(5).max(30),
  phone: z.string().max(30).optional().nullable(),
  email: z.string().email(),
  province: z.string().max(60).optional().nullable(),

  // زبان
  germanLevel: z.enum(['NONE', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional().nullable(),
  hasIelts: z.boolean().default(false),
  ieltsScore: z.string().max(10).optional().nullable(),
  hasToefl: z.boolean().default(false),
  toeflScore: z.string().max(10).optional().nullable(),

  // تحصیلی
  diplomaField: z.string().max(120).optional().nullable(),
  diplomaGpa: z.string().max(20).optional().nullable(),
  lastDegree: z.enum(['DIPLOMA', 'BACHELOR', 'MASTER', 'PHD']).optional().nullable(),
  bachelorUniversity: z.string().max(150).optional().nullable(),
  bachelorField: z.string().max(150).optional().nullable(),
  bachelorGpa: z.string().max(20).optional().nullable(),

  // هدف
  targetDegree: z.enum(['STUDIENKOLLEG', 'BACHELOR', 'MASTER', 'PHD', 'AUSBILDUNG']).optional().nullable(),
  targetField: z.string().max(150).optional().nullable(),
  targetUniversity: z.string().max(150).optional().nullable(),
  targetPreferences: z.array(PreferenceSchema).max(10).optional().nullable(),

  // شغلی
  jobTitle: z.string().max(120).optional().nullable(),
  workExperienceYears: z.string().max(20).optional().nullable(),
  currentlyEmployed: z.boolean().default(false),

  // تکمیلی
  howFoundUs: z.string().max(80).optional().nullable(),
  referralCode: z.string().max(80).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),

  // LEGAL-04 — required consent + optional marketing.
  consent: ConsentInputSchema.optional(),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`evaluation:${ip}`, 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'تعداد درخواست‌ها زیاد است. کمی صبر کنید.' },
      { status: 429 }
    );
  }

  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const parsed = EvaluationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'اطلاعات ناقص یا نامعتبر است', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Gate: terms checkbox must be true to persist. We accept the request
    // structurally but refuse to write without an explicit accept.
    if (!parsed.data.consent?.termsAccepted) {
      return NextResponse.json(
        { error: 'برای ارسال فرم، موافقت با حریم خصوصی و سلب مسئولیت لازم است.' },
        { status: 400 }
      );
    }

    // TRUST-10 — Germany-risk acknowledgement is required on every new
    // submission. Old rows stay NULL (the schema column is nullable).
    if (parsed.data.consent.germanyRiskAcknowledged !== true) {
      return NextResponse.json(
        { error: 'برای ارسال فرم، تایید سلب مسئولیت مسیر آلمان لازم است.' },
        { status: 400 }
      );
    }

    const { targetPreferences, consent, ...rest } = parsed.data;
    const consentMeta = extractClientMeta(req.headers);

    const evaluation = await prisma.evaluation.create({
      data: {
        ...rest,
        targetPreferences: targetPreferences ?? undefined,
        userId: session?.user?.id ?? null,
        ...consentDbFields(consent, consentMeta),
      },
      select: { id: true, createdAt: true },
    });

    const adminTo = process.env.ADMIN_NOTIFY_EMAIL;
    if (adminTo) {
      sendMail({
        to: adminTo,
        subject: `فرم ارزیابی جدید: ${parsed.data.fullName}`,
        html: `<div dir="rtl"><h2>فرم ارزیابی تحصیل در آلمان</h2>
          <p><b>نام:</b> ${escapeHtml(parsed.data.fullName)}</p>
          <p><b>ایمیل:</b> ${escapeHtml(parsed.data.email)}</p>
          <p><b>موبایل:</b> ${escapeHtml(parsed.data.mobile)}</p>
          <p><b>مقطع هدف:</b> ${escapeHtml(parsed.data.targetDegree ?? '-')}</p></div>`,
      }).catch((e) => console.error('eval notify failed', e));
    }

    return NextResponse.json(
      {
        evaluation,
        message: 'فرم ارزیابی شما با موفقیت ثبت شد. نتیجه ارزیابی به‌زودی از طریق ایمیل برایتان ارسال می‌شود.',
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('evaluation create error', err);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
