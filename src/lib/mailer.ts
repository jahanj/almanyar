import nodemailer from 'nodemailer';

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

  const html = `
    <div dir="rtl" style="font-family: Tahoma, Arial; line-height: 1.8;">
      <h2>درخواست مشاوره جدید</h2>
      <p><b>نام:</b> ${escapeHtml(payload.fullName)}</p>
      <p><b>ایمیل:</b> ${escapeHtml(payload.email)}</p>
      ${payload.phone ? `<p><b>تلفن:</b> ${escapeHtml(payload.phone)}</p>` : ''}
      ${payload.subject ? `<p><b>موضوع:</b> ${escapeHtml(payload.subject)}</p>` : ''}
      <hr/>
      <p style="white-space: pre-wrap;">${escapeHtml(payload.message)}</p>
    </div>
  `;

  return sendMail({
    to,
    subject: `درخواست جدید: ${payload.subject ?? payload.fullName}`,
    html,
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
  const greeting = payload.name?.trim()
    ? `سلام ${escapeHtml(payload.name)} عزیز،`
    : 'سلام،';

  const html = `
    <div dir="rtl" style="font-family: Tahoma, Arial; line-height: 1.9; color: #1f2937; max-width: 560px;">
      <p>${greeting}</p>
      <p>به‌روزرسانی جدیدی در «${escapeHtml(payload.leadLabel)}» شما داریم:</p>
      <blockquote style="white-space: pre-wrap; border-inline-start: 3px solid #047857; padding: 8px 14px; margin: 14px 0; background: #ecfdf5; color: #064e3b;">${escapeHtml(payload.message)}</blockquote>
      <p>اگر سؤالی دارید کافی است به همین ایمیل پاسخ دهید یا از طریق واتساپ در ارتباط باشید.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 28px 0 14px;"/>
      <p style="font-size: 12px; color: #6b7280;">
        این پیام از طرف <b>آلمانیار</b> ارسال شده است.<br/>
        وب‌سایت: <a href="https://almanyar.com" style="color: #047857;">almanyar.com</a> · واتساپ: +90 506 770 8295
      </p>
    </div>
  `;

  return sendMail({
    to: payload.to,
    subject: 'به‌روزرسانی پرونده شما — آلمانیار',
    html,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
