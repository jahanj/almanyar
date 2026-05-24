import { randomBytes, createHash } from 'crypto';
import { prisma } from './prisma';
import { sendMail } from './mailer';

type TokenType = 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';

const TTL: Record<TokenType, number> = {
  EMAIL_VERIFICATION: 24 * 60 * 60 * 1000, // 24h
  PASSWORD_RESET: 60 * 60 * 1000, // 1h
};

const hash = (raw: string) => createHash('sha256').update(raw).digest('hex');

/** Creates a single-use token, storing only its hash. Returns the raw token. */
export async function createToken(identifier: string, type: TokenType): Promise<string> {
  // Invalidate previous tokens of this type for the identifier.
  await prisma.verificationToken.deleteMany({ where: { identifier, type } });

  const raw = randomBytes(32).toString('hex');
  await prisma.verificationToken.create({
    data: {
      identifier,
      tokenHash: hash(raw),
      type,
      expires: new Date(Date.now() + TTL[type]),
    },
  });
  return raw;
}

/** Consumes a token; returns the identifier (email) if valid, else null. */
export async function consumeToken(raw: string, type: TokenType): Promise<string | null> {
  const record = await prisma.verificationToken.findUnique({ where: { tokenHash: hash(raw) } });
  if (!record || record.type !== type) return null;
  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { id: record.id } }).catch(() => {});
    return null;
  }
  await prisma.verificationToken.delete({ where: { id: record.id } });
  return record.identifier;
}

export function appUrl(path: string): string {
  const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  return `${base}${path}`;
}

/** Issues a fresh email-verification token and emails the link. */
export async function sendVerificationEmail(email: string, name?: string): Promise<void> {
  const token = await createToken(email, 'EMAIL_VERIFICATION');
  const link = appUrl(`/verify-email?token=${token}`);
  await sendMail({
    to: email,
    subject: 'تایید ایمیل — آلمانیار',
    html: `<div dir="rtl" style="font-family:Tahoma,Arial;line-height:1.8">
      <div style="text-align:center;margin-bottom:16px"><img src="${appUrl('/logo.png')}" alt="AlmanYar" width="200" style="max-width:200px;height:auto"/></div>
      <h2>${name ? `خوش آمدید ${name}` : 'تایید ایمیل'}</h2>
      <p>برای تایید ایمیل خود روی لینک زیر کلیک کنید (تا ۲۴ ساعت معتبر است):</p>
      <p><a href="${link}">${link}</a></p>
    </div>`,
  });
}
