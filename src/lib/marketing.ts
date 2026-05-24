import { createHmac, timingSafeEqual } from 'node:crypto';
import { sendMail } from './mailer';
import { SITE } from './seo';

/**
 * Phase-4 §5 — marketing-list helpers.
 *
 * - signMarketingToken(userId) returns an HMAC-signed token used as the
 *   `?token=…` query param on the unsubscribe URL. The token is
 *   tamper-proof but doesn't require login, so the email's "unsubscribe"
 *   link works in any client without auth round-trips.
 * - verifyMarketingToken(token) returns the userId or null. Uses
 *   timingSafeEqual to compare signatures.
 * - sendMarketingWelcomeEmail(user) fires the one-time confirmation
 *   email the moment the user opts in at registration.
 *
 * The secret is `MARKETING_TOKEN_SECRET` (or falls back to
 * NEXTAUTH_SECRET so we don't fail-closed in a misconfigured env).
 */

const SEPARATOR = '.';

function secret(): string {
  return process.env.MARKETING_TOKEN_SECRET ?? process.env.NEXTAUTH_SECRET ?? '';
}

export function signMarketingToken(userId: string): string {
  const sig = createHmac('sha256', secret()).update(userId).digest('base64url');
  return `${userId}${SEPARATOR}${sig}`;
}

export function verifyMarketingToken(token: string): string | null {
  const i = token.lastIndexOf(SEPARATOR);
  if (i <= 0) return null;
  const userId = token.slice(0, i);
  const provided = token.slice(i + 1);
  const expected = createHmac('sha256', secret()).update(userId).digest('base64url');
  try {
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return null;
    return timingSafeEqual(a, b) ? userId : null;
  } catch {
    return null;
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Welcome confirmation. Fires once, at registration if the user
 *  ticked the marketing checkbox. Separate from the email-verification
 *  message — different intent, different cadence. */
export async function sendMarketingWelcomeEmail(user: { id: string; email: string; name?: string | null }) {
  const greeting = user.name?.trim() ? `سلام ${escapeHtml(user.name)} عزیز،` : 'سلام،';
  const unsubUrl = `${SITE.url}/api/marketing/unsubscribe?token=${encodeURIComponent(signMarketingToken(user.id))}`;

  const html = `
    <div dir="rtl" style="font-family: Tahoma, Arial; line-height: 1.9; color: #1f2937; max-width: 560px;">
      <p>${greeting}</p>
      <p>به فهرست خبرنامه <b>آلمانیار</b> خوش آمدید — این ایمیل تایید عضویت شماست.</p>
      <p>گاه‌به‌گاه راهنماها و اطلاعات مفید درباره مهاجرت تحصیلی به آلمان از مسیر ترکیه را برای شما می‌فرستیم. وعده می‌دهیم اسپم نباشد.</p>
      <p>هر زمان خواستید می‌توانید با یک کلیک لغو عضویت کنید:</p>
      <p><a href="${unsubUrl}" style="display: inline-block; background: #e5e7eb; color: #111827; padding: 8px 16px; border-radius: 6px; text-decoration: none;">لغو عضویت</a></p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 28px 0 14px;"/>
      <p style="font-size: 12px; color: #6b7280;">
        آلمانیار · <a href="${SITE.url}" style="color: #047857;">${SITE.url.replace('https://', '')}</a>
      </p>
    </div>
  `;

  return sendMail({
    to: user.email,
    subject: 'به خبرنامه آلمانیار خوش آمدید',
    html,
  });
}
