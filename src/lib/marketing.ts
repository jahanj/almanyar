import { createHmac, timingSafeEqual } from 'node:crypto';
import { sendMail } from './mailer';
import { SITE } from './seo';
import { renderEmail } from './email-template';

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

/** Welcome confirmation. Fires once, at registration if the user
 *  ticked the marketing checkbox. Separate from the email-verification
 *  message — different intent, different cadence. */
export async function sendMarketingWelcomeEmail(user: { id: string; email: string; name?: string | null }) {
  const unsubUrl = `${SITE.url}/api/marketing/unsubscribe?token=${encodeURIComponent(signMarketingToken(user.id))}`;

  return sendMail({
    to: user.email,
    subject: 'به خبرنامه آلمانیار خوش آمدید',
    html: renderEmail({
      preheader: 'عضویت شما در خبرنامه آلمانیار تأیید شد.',
      heading: user.name?.trim() ? `${user.name} عزیز، خوش آمدید` : 'به خبرنامه آلمانیار خوش آمدید',
      paragraphs: [
        'عضویت شما در فهرست خبرنامه آلمانیار تأیید شد. این پیام تنها برای اطلاع و تأیید عضویت ارسال شده است.',
        'گاه‌به‌گاه راهنماها و اطلاعات کاربردی درباره‌ی مهاجرت تحصیلی به آلمان از مسیر ترکیه — تجربه‌های واقعی، نکات سفارت، آزمون‌های زبان، هزینه‌ها و فرصت‌های پذیرش — برای شما ارسال می‌کنیم.',
      ],
      callout: {
        tone: 'success',
        text: 'وعده می‌دهیم اسپم نباشد. ایمیل‌ها هدفمند و کم‌تعداد خواهد بود.',
      },
      unsubscribeUrl: unsubUrl,
    }),
  });
}

