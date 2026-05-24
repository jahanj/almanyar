import { prisma } from './prisma';
import { sendMail } from './mailer';

/**
 * Phase-5 TASK-04 — workspace notifications.
 *
 * Per PHASE-5-PLAN Decision C: per-event emails with a hard cap of
 * 5 / userId / kind / 24h. The cap is "soft DoS protection" — if the
 * admin truly does add 20 tasks at once, the student gets the first 5
 * and the rest live in the dashboard only.
 *
 * Cap is enforced against the `kind` field stored as `${kind}:${appId}`
 * so a noisy "task.added" run on Case A doesn't crowd out a single
 * "task.adminTicked" on Case B.
 *
 * SMTP failure is logged, never thrown — a missed email must not break
 * the underlying admin action.
 */

const RATE_WINDOW_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT = 5;

export type NotificationKind =
  | 'task.studentTicked' // → admin (student said "done")
  | 'task.added'         // → student (admin created a new step)
  | 'task.adminTicked'   // → student (admin confirmed step is DONE)
  | 'task.blocked';      // → student (admin marked step BLOCKED)

interface SendArgs {
  kind: NotificationKind;
  recipientUserId: string;
  recipientEmail: string;
  applicationId: string;
  subject: string;
  html: string;
}

async function send({
  kind,
  recipientUserId,
  recipientEmail,
  applicationId,
  subject,
  html,
}: SendArgs): Promise<{ sent: boolean; reason?: string }> {
  const ledgerKind = `${kind}:${applicationId}`;
  const since = new Date(Date.now() - RATE_WINDOW_MS);

  const recent = await prisma.emailRateLimit.count({
    where: { userId: recipientUserId, kind: ledgerKind, sentAt: { gte: since } },
  });
  if (recent >= RATE_LIMIT) {
    return { sent: false, reason: 'rate_limited' };
  }

  try {
    await sendMail({ to: recipientEmail, subject, html });
    await prisma.emailRateLimit.create({
      data: { userId: recipientUserId, kind: ledgerKind },
    });
    return { sent: true };
  } catch (err) {
    console.error('[notify] send failed', kind, applicationId, err);
    return { sent: false, reason: 'smtp_error' };
  }
}

function shell(inner: string): string {
  return `
    <div dir="rtl" style="font-family: Tahoma, Arial; line-height: 1.9; color: #1f2937; max-width: 560px;">
      ${inner}
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 28px 0 14px;"/>
      <p style="font-size: 12px; color: #6b7280;">
        پنل کاربری شما در <a href="https://almanyar.com/fa/dashboard" style="color: #047857;">almanyar.com</a> در دسترس است.
      </p>
    </div>
  `;
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Admin-facing: student ticked a task as done. */
export async function notifyAdminStudentTicked(args: {
  applicationId: string;
  applicationTitle: string;
  taskTitle: string;
  studentName: string;
}) {
  const to = process.env.ADMIN_NOTIFY_EMAIL;
  if (!to) return { sent: false, reason: 'no_admin_email' };

  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  });
  if (!admin) return { sent: false, reason: 'no_admin_user' };

  const html = `
    <h2 style="font-size: 16px; margin: 0 0 12px;">گزارش انجام گام</h2>
    <p><b>${esc(args.studentName)}</b> اعلام کرد که گام زیر را انجام داده است:</p>
    <blockquote style="border-inline-start: 3px solid #047857; padding: 8px 14px; margin: 14px 0; background: #ecfdf5; color: #064e3b;">
      «${esc(args.taskTitle)}» — پرونده «${esc(args.applicationTitle)}»
    </blockquote>
    <p>برای تأیید نهایی روی این گام، وارد پنل ادمین شوید.</p>
  `;

  return send({
    kind: 'task.studentTicked',
    recipientUserId: admin.id,
    recipientEmail: to,
    applicationId: args.applicationId,
    subject: `گام انجام شد: ${args.taskTitle}`,
    html: shell(html),
  });
}

/** Student-facing: admin added a new step. */
export async function notifyStudentTaskAdded(args: {
  userId: string;
  userEmail: string;
  applicationId: string;
  applicationTitle: string;
  taskTitle: string;
}) {
  const html = `
    <h2 style="font-size: 16px; margin: 0 0 12px;">گام جدید در پرونده شما</h2>
    <p>یک گام تازه به پرونده «${esc(args.applicationTitle)}» اضافه شد:</p>
    <blockquote style="border-inline-start: 3px solid #2563eb; padding: 8px 14px; margin: 14px 0; background: #eff6ff; color: #1e3a8a;">
      «${esc(args.taskTitle)}»
    </blockquote>
    <p>برای دیدن جزئیات و علامت‌گذاری «انجام شد» وارد پنل خود شوید.</p>
  `;

  return send({
    kind: 'task.added',
    recipientUserId: args.userId,
    recipientEmail: args.userEmail,
    applicationId: args.applicationId,
    subject: `گام جدید: ${args.taskTitle}`,
    html: shell(html),
  });
}

/** Student-facing: admin confirmed the step is DONE. */
export async function notifyStudentTaskAdminTicked(args: {
  userId: string;
  userEmail: string;
  applicationId: string;
  applicationTitle: string;
  taskTitle: string;
}) {
  const html = `
    <h2 style="font-size: 16px; margin: 0 0 12px;">گام شما تأیید شد ✅</h2>
    <p>گام زیر در پرونده «${esc(args.applicationTitle)}» توسط مشاور شما به عنوان «انجام‌شده» تأیید شد:</p>
    <blockquote style="border-inline-start: 3px solid #047857; padding: 8px 14px; margin: 14px 0; background: #ecfdf5; color: #064e3b;">
      «${esc(args.taskTitle)}»
    </blockquote>
    <p>تبریک! یک قدم به هدف نزدیک‌تر شدید.</p>
  `;

  return send({
    kind: 'task.adminTicked',
    recipientUserId: args.userId,
    recipientEmail: args.userEmail,
    applicationId: args.applicationId,
    subject: `گام تأیید شد: ${args.taskTitle}`,
    html: shell(html),
  });
}

/** Student-facing: admin marked the step BLOCKED — student input needed. */
export async function notifyStudentTaskBlocked(args: {
  userId: string;
  userEmail: string;
  applicationId: string;
  applicationTitle: string;
  taskTitle: string;
}) {
  const html = `
    <h2 style="font-size: 16px; margin: 0 0 12px;">گامی نیاز به توجه دارد</h2>
    <p>گام زیر در پرونده «${esc(args.applicationTitle)}» به عنوان «منتظر اقدام شما» علامت‌گذاری شد:</p>
    <blockquote style="border-inline-start: 3px solid #b45309; padding: 8px 14px; margin: 14px 0; background: #fffbeb; color: #78350f;">
      «${esc(args.taskTitle)}»
    </blockquote>
    <p>برای دیدن توضیحات مشاور وارد پنل شوید.</p>
  `;

  return send({
    kind: 'task.blocked',
    recipientUserId: args.userId,
    recipientEmail: args.userEmail,
    applicationId: args.applicationId,
    subject: `نیاز به اقدام: ${args.taskTitle}`,
    html: shell(html),
  });
}
