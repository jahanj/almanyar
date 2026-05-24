import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMarketingToken } from '@/lib/marketing';
import { localePath } from '@/lib/i18n';

/**
 * Phase-4 §5 — one-click unsubscribe.
 *
 * GET /api/marketing/unsubscribe?token=<userId>.<HMAC>
 *
 * - Verifies the HMAC. Tamper / bad / missing token → silent 302 to
 *   the confirmation page (we don't disclose whether the userId
 *   exists; deliverability-wise, the user clicked something we sent
 *   them, so the friendly fallback is correct).
 * - Sets marketingConsent=false + marketingConsentAt=null on the user.
 * - Redirects to /fa/unsubscribed (302).
 *
 * Idempotent — re-clicking after unsubscribing just lands on the
 * confirmation page again.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token') ?? '';
  const userId = verifyMarketingToken(token);
  const redirect = new URL(localePath('fa', '/unsubscribed'), url.origin);

  if (userId) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { marketingConsent: false, marketingConsentAt: null },
      });
    } catch {
      // User deleted? Silent — friendly UX wins over disclosure.
    }
  }
  return NextResponse.redirect(redirect, 302);
}
