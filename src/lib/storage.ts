import { promises as fs } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

/**
 * File storage abstraction. Currently backed by local disk so it can run on a
 * single VPS. Swap the implementations below for S3/MinIO later without
 * changing call sites. Files are stored OUTSIDE the public web root and served
 * only through an authenticated API route.
 */

const STORAGE_DIR = process.env.STORAGE_DIR
  ? path.resolve(process.env.STORAGE_DIR)
  : path.resolve(process.cwd(), 'uploads');

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Allowed MIME types mapped to canonical extensions.
export const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

export function isAllowedType(mime: string): boolean {
  return mime in ALLOWED_TYPES;
}

export function generateStoredName(mime: string): string {
  const ext = ALLOWED_TYPES[mime] ?? 'bin';
  return `${Date.now()}-${randomBytes(16).toString('hex')}.${ext}`;
}

async function ensureDir() {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
}

/** Reject any storedName that tries to escape the storage directory. */
function safePath(storedName: string): string {
  const base = path.basename(storedName);
  if (base !== storedName) throw new Error('Invalid file name');
  return path.join(STORAGE_DIR, base);
}

export async function saveFile(storedName: string, data: Buffer): Promise<void> {
  await ensureDir();
  await fs.writeFile(safePath(storedName), data, { mode: 0o600 });
}

export async function readFile(storedName: string): Promise<Buffer> {
  return fs.readFile(safePath(storedName));
}

export async function deleteFile(storedName: string): Promise<void> {
  try {
    await fs.unlink(safePath(storedName));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
  }
}
