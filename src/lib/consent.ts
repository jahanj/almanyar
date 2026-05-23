import { z } from 'zod';
import { TERMS_VERSION } from '@/config/legal';

/**
 * Consent record captured at form-submit time. Stored alongside the
 * submission (Evaluation, ContactRequest) so we can later prove which
 * terms version the user agreed to.
 *
 * - termsAccepted:            REQUIRED. Form must block submission if false.
 * - germanyRiskAcknowledged:  REQUIRED (TRUST-10). Explicit acknowledgement
 *                             that German-side outcomes are outside our control.
 * - marketingConsent:         OPTIONAL (visible-but-unchecked per GDPR norm).
 */
export const ConsentInputSchema = z.object({
  termsAccepted: z.boolean(),
  germanyRiskAcknowledged: z.boolean(),
  marketingConsent: z.boolean().optional(),
});

export type ConsentInput = z.infer<typeof ConsentInputSchema>;

/** Persian wording for the Germany-risk checkbox label. Lives here so
 *  the eval form, the contact form, and the API rejection message
 *  read from the same string. */
export const GERMANY_RISK_LABEL =
  'متوجه شدم که موفقیت در مسیر ویزا و پذیرش دانشگاه‌های آلمان به عوامل خارج از کنترل آلمانیار (مانند تصمیم سفارت آلمان، دانشگاه‌ها، و مراکز آزمون) بستگی دارد و آلمانیار این بخش از مسیر را تضمین نمی‌کند.';

/** Reads client IP + user-agent from the request headers (nginx sets
 *  X-Forwarded-For + X-Real-IP; falls back to whatever's present). */
export function extractClientMeta(headers: Headers) {
  const xff = headers.get('x-forwarded-for') ?? '';
  const ip = xff.split(',')[0]?.trim() || headers.get('x-real-ip') || null;
  const userAgent = headers.get('user-agent') || null;
  return { ip, userAgent };
}

/** Resolves the consent fields written to the DB. Returns nulls when
 *  the input is empty / declined; the migration columns are all nullable
 *  so historical rows stay unaffected. */
export function consentDbFields(
  input: ConsentInput | undefined,
  meta: { ip: string | null; userAgent: string | null },
) {
  if (!input || !input.termsAccepted) {
    return {
      consentAcceptedAt: null,
      consentTermsVersion: null,
      consentIp: null,
      consentUserAgent: null,
      marketingConsent: null,
      germanyRiskAcknowledged: null,
      germanyRiskAcknowledgedAt: null,
    };
  }
  const now = new Date();
  return {
    consentAcceptedAt: now,
    consentTermsVersion: TERMS_VERSION,
    consentIp: meta.ip,
    consentUserAgent: meta.userAgent,
    marketingConsent: input.marketingConsent ?? false,
    germanyRiskAcknowledged: input.germanyRiskAcknowledged === true,
    germanyRiskAcknowledgedAt: input.germanyRiskAcknowledged === true ? now : null,
  };
}
