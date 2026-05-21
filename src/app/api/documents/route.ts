import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, requireVerifiedUser } from '@/lib/session';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import {
  ALLOWED_TYPES, MAX_FILE_SIZE, generateStoredName, isAllowedType, saveFile,
} from '@/lib/storage';

const VALID_CATEGORIES = [
  'PASSPORT', 'DIPLOMA', 'TRANSCRIPT', 'LANGUAGE_CERTIFICATE', 'PHOTO',
  'FINANCIAL_PROOF', 'RESUME', 'MOTIVATION_LETTER', 'ACCEPTANCE_LETTER', 'INSURANCE', 'OTHER',
];

export async function GET() {
  const guard = await requireUser();
  if (guard.error) return guard.error;

  const documents = await prisma.document.findMany({
    where: { userId: guard.session.user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, category: true, status: true, originalName: true,
      mimeType: true, size: true, reviewNote: true, applicationId: true, createdAt: true,
    },
  });

  return NextResponse.json({ documents });
}

export async function POST(req: Request) {
  const guard = await requireVerifiedUser();
  if (guard.error) return guard.error;

  const ip = getClientIp(req);
  const rl = rateLimit(`upload:${guard.session.user.id}:${ip}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: 'تعداد آپلودها زیاد است. کمی صبر کنید.' }, { status: 429 });
  }

  const form = await req.formData();
  const file = form.get('file');
  const category = String(form.get('category') ?? 'OTHER');
  const applicationId = form.get('applicationId') ? String(form.get('applicationId')) : null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'فایلی ارسال نشده است' }, { status: 400 });
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: 'دسته‌بندی نامعتبر است' }, { status: 400 });
  }
  if (!isAllowedType(file.type)) {
    return NextResponse.json(
      { error: `فرمت فایل مجاز نیست. فرمت‌های مجاز: ${Object.values(ALLOWED_TYPES).join('، ')}` },
      { status: 400 }
    );
  }
  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'حجم فایل باید بین ۱ بایت تا ۱۰ مگابایت باشد' }, { status: 400 });
  }

  // If an applicationId is supplied, it must belong to this user.
  if (applicationId) {
    const app = await prisma.application.findFirst({
      where: { id: applicationId, userId: guard.session.user.id },
      select: { id: true },
    });
    if (!app) return NextResponse.json({ error: 'پرونده نامعتبر است' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storedName = generateStoredName(file.type);
  await saveFile(storedName, buffer);

  const doc = await prisma.document.create({
    data: {
      userId: guard.session.user.id,
      applicationId,
      category: category as never,
      originalName: file.name.slice(0, 200),
      storedName,
      mimeType: file.type,
      size: file.size,
    },
    select: { id: true, originalName: true, status: true, category: true, createdAt: true },
  });

  return NextResponse.json({ document: doc, message: 'فایل با موفقیت آپلود شد' }, { status: 201 });
}
