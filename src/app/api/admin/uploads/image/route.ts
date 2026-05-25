import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import {
  ALLOWED_TYPES,
  generateStoredName,
  isAllowedType,
  MAX_FILE_SIZE,
  saveFile,
} from '@/lib/storage';

/**
 * Phase-8C — public-image upload endpoint for the post editor.
 *
 * Used for:
 *   - cover-image picker on the post form
 *   - (future 8G) in-editor inline images
 *
 * Admin-only POST. Returns { url } pointing at the public serve route
 * `/api/uploads/<storedName>` which is auth-free (covers must be visible
 * to /fa/news readers).
 *
 * Restrict MIME to images only — re-using the project-wide ALLOWED_TYPES
 * map but filtering out PDF/DOC/DOCX which only make sense for the
 * customer document flow.
 */

const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file' }, { status: 400 });
  }

  if (!isAllowedType(file.type) || !IMAGE_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: 'فقط فرمت‌های JPEG/PNG/WebP پذیرفته می‌شوند' },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'حداکثر اندازه فایل ۱۰ مگابایت است' },
      { status: 413 },
    );
  }

  const storedName = generateStoredName(file.type);
  const buffer = Buffer.from(await file.arrayBuffer());
  await saveFile(storedName, buffer);

  // Touch ALLOWED_TYPES so the import doesn't get dropped — we still
  // rely on its keys for the extension mapping inside generateStoredName.
  void ALLOWED_TYPES;

  return NextResponse.json({
    url: `/api/uploads/${storedName}`,
    storedName,
    mime: file.type,
    size: file.size,
  });
}
