import { SITE } from './seo';

/**
 * Phase-7 — premium transactional-email scaffold.
 *
 * One file, called by every email sender (verification, password reset,
 * welcome, lead notify, workspace notify, admin alert). Renders a full
 * HTML document with:
 *
 *   - bulletproof <table> layout (Outlook-safe)
 *   - all CSS inlined (Gmail strips <style> blocks on some clients)
 *   - `dir="rtl"` everywhere — Persian-first
 *   - 600px max width with fluid scaling on mobile
 *   - VML button fallback for Outlook
 *   - hosted-image logo (https://almanyar.com/logo.png) with alt-text
 *     fallback when the client blocks images
 *
 * The aesthetic is Apple/Linear/Stripe: warm off-white background,
 * crisp white card, subtle 1px borders, large breathing-room headings,
 * one accent gradient for the brand stripe at the top.
 */

const BRAND = {
  bgPage:     '#FAFAF7', // warm off-white outside the card
  bgCard:     '#FFFFFF',
  border:     '#E5E7EB',
  dividerSub: '#F3F4F6',
  text:       '#111827',
  textMuted:  '#6B7280',
  textSubtle: '#9CA3AF',
  primary:    '#047857', // emerald — matches site
  primaryDk:  '#065F46',
  accent:     '#D97706', // warm gold — pairs with brand artwork
  bandStart:  '#047857',
  bandEnd:    '#D97706',
} as const;

const FONT_STACK = "'Tahoma','Helvetica Neue',Helvetica,Arial,sans-serif";

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export interface EmailContent {
  /** Hidden preview snippet shown by clients before the body opens. */
  preheader: string;
  /** Large H1 at the top of the card. */
  heading: string;
  /** Paragraphs in order. Newlines inside a paragraph become <br/>. */
  paragraphs: string[];
  /** Optional CTA. */
  button?: { label: string; url: string };
  /** Optional verification/OTP code, shown in a big monospaced box. */
  code?: string;
  /** Optional secondary tinted callout (security note, expiry, etc.). */
  callout?: { tone: 'info' | 'warn' | 'success'; text: string };
  /** Optional closing paragraphs shown after code/button/callout. */
  closing?: string[];
  /** Optional unsubscribe URL (added to the footer below the divider). */
  unsubscribeUrl?: string;
}

/**
 * Top-level render. Returns a complete HTML document ready to pass to
 * nodemailer's `html` field.
 */
export function renderEmail(content: EmailContent): string {
  const logoUrl = `${SITE.url}/logo.png`;
  const subjectAlt = esc(content.heading);

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="fa" dir="rtl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<meta name="x-apple-disable-message-reformatting"/>
<meta name="color-scheme" content="light"/>
<meta name="supported-color-schemes" content="light"/>
<title>${subjectAlt}</title>
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style>
  @media (max-width:620px){
    .container{width:100% !important;padding:0 12px !important}
    .card{padding:28px 22px !important}
    .h1{font-size:22px !important;line-height:1.4 !important}
    .code-box{font-size:24px !important;letter-spacing:8px !important}
  }
</style>
</head>
<body style="margin:0;padding:0;background:${BRAND.bgPage};font-family:${FONT_STACK};color:${BRAND.text};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%">
<!-- Hidden preheader -->
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;color:transparent">${esc(content.preheader)}</div>

<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:${BRAND.bgPage}">
  <tr><td align="center" style="padding:32px 16px">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="container" width="600" style="width:600px;max-width:600px">

      <!-- Brand stripe -->
      <tr><td style="background:linear-gradient(90deg,${BRAND.bandStart} 0%,${BRAND.bandEnd} 100%);height:4px;line-height:4px;font-size:4px;border-radius:14px 14px 0 0">&nbsp;</td></tr>

      <!-- White card -->
      <tr><td class="card" style="background:${BRAND.bgCard};border:1px solid ${BRAND.border};border-top:0;border-radius:0 0 14px 14px;padding:36px 40px">

        <!-- Logo -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr>
          <td align="center" style="padding-bottom:26px">
            <a href="${SITE.url}" style="text-decoration:none;color:${BRAND.text}">
              <img src="${logoUrl}" alt="آلمانیار" width="180" style="display:block;width:180px;max-width:180px;height:auto;border:0;outline:none;text-decoration:none"/>
            </a>
          </td>
        </tr></table>

        <!-- Heading -->
        <h1 class="h1" dir="rtl" style="margin:0 0 18px;font-family:${FONT_STACK};font-size:24px;line-height:1.5;font-weight:700;color:${BRAND.text};text-align:right">${esc(content.heading)}</h1>

        <!-- Paragraphs -->
        ${content.paragraphs.map((p) => `
          <p dir="rtl" style="margin:0 0 14px;font-family:${FONT_STACK};font-size:15px;line-height:1.85;color:${BRAND.text};text-align:right">${esc(p).replace(/\n/g, '<br/>')}</p>
        `).join('')}

        ${content.code ? codeBox(content.code) : ''}

        ${content.button ? primaryButton(content.button.label, content.button.url) : ''}

        ${content.callout ? calloutBox(content.callout) : ''}

        ${(content.closing ?? []).map((p) => `
          <p dir="rtl" style="margin:0 0 14px;font-family:${FONT_STACK};font-size:15px;line-height:1.85;color:${BRAND.text};text-align:right">${esc(p).replace(/\n/g, '<br/>')}</p>
        `).join('')}

        <!-- Divider -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top:30px"><tr>
          <td style="border-top:1px solid ${BRAND.dividerSub};height:1px;font-size:0;line-height:0">&nbsp;</td>
        </tr></table>

        <!-- Footer -->
        ${footer(content.unsubscribeUrl)}

      </td></tr>

      <!-- Footnote outside card -->
      <tr><td align="center" style="padding:18px 8px;font-family:${FONT_STACK};font-size:11px;line-height:1.6;color:${BRAND.textSubtle}">
        این پیام به‌صورت خودکار از سامانه آلمانیار ارسال شده است.<br/>
        <a href="${SITE.url}" style="color:${BRAND.textSubtle};text-decoration:underline">${SITE.url.replace(/^https?:\/\//, '')}</a>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function codeBox(code: string): string {
  const safe = esc(code);
  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:8px 0 24px"><tr><td align="center">
    <div class="code-box" dir="ltr" style="display:inline-block;background:${BRAND.dividerSub};border:1px solid ${BRAND.border};border-radius:10px;padding:18px 28px;font-family:'SF Mono','Menlo','Consolas','Courier New',monospace;font-size:28px;letter-spacing:10px;font-weight:700;color:${BRAND.text};direction:ltr;unicode-bidi:bidi-override">${safe}</div>
  </td></tr></table>`;
}

function primaryButton(label: string, url: string): string {
  const safeLabel = esc(label);
  const safeUrl = esc(url);
  // Bulletproof button — VML for Outlook, table-cell for everyone else.
  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:8px 0 24px"><tr><td align="center">
    <!--[if mso]>
    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${safeUrl}" style="height:48px;v-text-anchor:middle;width:260px;" arcsize="20%" stroke="f" fillcolor="${BRAND.primary}">
      <w:anchorlock/>
      <center style="color:#FFFFFF;font-family:${FONT_STACK};font-size:15px;font-weight:700">${safeLabel}</center>
    </v:roundrect>
    <![endif]-->
    <!--[if !mso]><!-- -->
    <a href="${safeUrl}" style="display:inline-block;background:${BRAND.primary};color:#FFFFFF;font-family:${FONT_STACK};font-size:15px;font-weight:700;line-height:48px;text-align:center;text-decoration:none;border-radius:10px;padding:0 32px;min-width:180px;mso-hide:all">${safeLabel}</a>
    <!--<![endif]-->
  </td></tr></table>`;
}

function calloutBox({ tone, text }: { tone: 'info' | 'warn' | 'success'; text: string }): string {
  const style = {
    info:    { bg: '#EFF6FF', border: '#BFDBFE', color: '#1E3A8A' },
    warn:    { bg: '#FFFBEB', border: '#FDE68A', color: '#78350F' },
    success: { bg: '#ECFDF5', border: '#A7F3D0', color: '#064E3B' },
  }[tone];
  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:8px 0 20px"><tr><td>
    <div dir="rtl" style="background:${style.bg};border:1px solid ${style.border};border-radius:10px;padding:14px 18px;font-family:${FONT_STACK};font-size:13px;line-height:1.8;color:${style.color};text-align:right">${esc(text).replace(/\n/g, '<br/>')}</div>
  </td></tr></table>`;
}

function footer(unsubscribeUrl?: string): string {
  const wa = SITE.phone.replace(/[^\d]/g, '');
  const unsubLine = unsubscribeUrl ? `
    <p style="margin:14px 0 0;font-family:${FONT_STACK};font-size:12px;line-height:1.7;color:${BRAND.textMuted};text-align:right">
      اگر دیگر نمی‌خواهید این نوع ایمیل را دریافت کنید،
      <a href="${esc(unsubscribeUrl)}" style="color:${BRAND.primary};text-decoration:underline">لغو عضویت</a>
      کنید.
    </p>` : '';

  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top:22px"><tr><td>
    <p dir="rtl" style="margin:0;font-family:${FONT_STACK};font-size:13px;line-height:1.8;color:${BRAND.textMuted};text-align:right">
      <strong style="color:${BRAND.text}">آلمانیار</strong> — مشاور تخصصی مهاجرت تحصیلی به آلمان از مسیر ترکیه
    </p>
    <p dir="rtl" style="margin:6px 0 0;font-family:${FONT_STACK};font-size:13px;line-height:1.8;color:${BRAND.textMuted};text-align:right">
      <a href="mailto:${SITE.email}" style="color:${BRAND.primary};text-decoration:none">${SITE.email}</a>
      &nbsp;·&nbsp;
      <a href="https://wa.me/${wa}" style="color:${BRAND.primary};text-decoration:none">واتساپ</a>
      &nbsp;·&nbsp;
      <a href="${SITE.url}" style="color:${BRAND.primary};text-decoration:none">${SITE.url.replace(/^https?:\/\//, '')}</a>
    </p>
    ${unsubLine}
  </td></tr></table>`;
}
