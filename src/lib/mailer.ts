import nodemailer from 'nodemailer';
import { renderEmail } from './email-template';
import { SITE } from './seo';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const t = getTransporter();
  if (!t) {
    console.warn('SMTP not configured; skipping email to', opts.to);
    return { skipped: true };
  }

  const info = await t.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    ...opts,
  });

  return { messageId: info.messageId };
}

export async function notifyAdminNewContact(payload: {
  fullName: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
}) {
  const to = process.env.ADMIN_NOTIFY_EMAIL;
  if (!to) return { skipped: true };

  const summary = [
    `نام: ${payload.fullName}`,
    `ایمیل: ${payload.email}`,
    payload.phone ? `تلفن: ${payload.phone}` : null,
    payload.subject ? `موضوع: ${payload.subject}` : null,
  ].filter(Boolean).join('\n');

  return sendMail({
    to,
    subject: `درخواست جدید: ${payload.subject ?? payload.fullName}`,
    html: renderEmail({
      preheader: `${payload.fullName} درخواست مشاوره فرستاد`,
      heading: 'درخواست مشاوره‌ی جدید',
      paragraphs: [
        'یک درخواست تماس تازه از طریق فرم سایت دریافت شد.',
        `متن پیام:\n${payload.message}`,
      ],
      callout: { tone: 'info', text: summary },
      button: { label: 'باز کردن پنل ادمین', url: `${SITE.url}/admin/contacts` },
    }),
  });
}

/**
 * Phase-4 §4 — admin → lead notification.
 *
 * Triggered by the explicit "ارسال یادداشت برای مشتری" button on the
 * admin contact / evaluation / application pages. Sends the owner's
 * `adminNotes` (or a custom override) to the lead's email.
 *
 * Subject is constant for SPF/threading; the lead sees one ongoing
 * conversation rather than scattered subjects per update.
 */
export async function notifyCustomer(payload: {
  to: string;
  name?: string | null;
  message: string;
  leadLabel: string; // e.g. "پرونده ارزیابی" / "پرونده تماس"
}) {
  return sendMail({
    to: payload.to,
    subject: 'به‌روزرسانی پرونده شما — آلمانیار',
    html: renderEmail({
      preheader: `یادداشت تازه‌ای در ${payload.leadLabel} شما داریم`,
      heading: payload.name?.trim() ? `${payload.name} عزیز،` : 'سلام،',
      paragraphs: [
        `به‌روزرسانی تازه‌ای در «${payload.leadLabel}» شما داریم:`,
      ],
      callout: { tone: 'success', text: payload.message },
      closing: [
        'اگر سؤالی دارید کافی است به همین ایمیل پاسخ دهید یا از طریق واتساپ در ارتباط باشید.',
      ],
    }),
  });
}
