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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
