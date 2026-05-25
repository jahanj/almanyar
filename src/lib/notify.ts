import { prisma } from './prisma';
import { sendMail } from './mailer';
import { renderEmail } from './email-template';
import { SITE } from './seo';

/**
 * Phase-5 TASK-04 — workspace notifications (rebranded in Phase-7).
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
 *
 * All four templates render through the shared `renderEmail()` shell
 * (lib/email-template.ts) so they inherit logo, brand stripe, button
 * styling, mobile responsiveness, and Outlook fallbacks.
 */

const RATE_WINDOW_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT = 5;

const DASHBOARD_URL = `${SITE.url}/fa/dashboard`;
const ADMIN_URL = `${SITE.url}/admin/applications`;

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

  return send({
    kind: 'task.studentTicked',
    recipientUserId: admin.id,
    recipientEmail: to,
    applicationId: args.applicationId,
    subject: `گام انجام شد: ${args.taskTitle}`,
    html: renderEmail({
      preheader: `${args.studentName} گام «${args.taskTitle}» را به‌عنوان انجام‌شده علامت زد`,
      heading: 'گزارش انجام گام',
      paragraphs: [
        `${args.studentName} اعلام کرد که گام زیر را انجام داده است:`,
      ],
      callout: {
        tone: 'success',
        text: `«${args.taskTitle}»\nپرونده: ${args.applicationTitle}`,
      },
      closing: [
        'برای تأیید نهایی روی این گام، وارد پنل ادمین شوید.',
      ],
      button: { label: 'باز کردن پنل ادمین', url: ADMIN_URL },
    }),
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
  return send({
    kind: 'task.added',
    recipientUserId: args.userId,
    recipientEmail: args.userEmail,
    applicationId: args.applicationId,
    subject: `گام جدید: ${args.taskTitle}`,
    html: renderEmail({
      preheader: `یک گام تازه به پرونده‌ی شما اضافه شد`,
      heading: 'گام جدید در پرونده‌ی شما',
      paragraphs: [
        `یک گام تازه به پرونده‌ی «${args.applicationTitle}» اضافه شد:`,
      ],
      callout: {
        tone: 'info',
        text: `«${args.taskTitle}»`,
      },
      closing: [
        'برای دیدن جزئیات و علامت‌گذاری «انجام شد»، وارد پنل کاربری خود شوید.',
      ],
      button: { label: 'مشاهده پنل من', url: DASHBOARD_URL },
    }),
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
  return send({
    kind: 'task.adminTicked',
    recipientUserId: args.userId,
    recipientEmail: args.userEmail,
    applicationId: args.applicationId,
    subject: `گام تأیید شد: ${args.taskTitle}`,
    html: renderEmail({
      preheader: `گام «${args.taskTitle}» توسط مشاور تأیید شد`,
      heading: 'گام شما تأیید شد ✅',
      paragraphs: [
        `گام زیر در پرونده‌ی «${args.applicationTitle}» توسط مشاور شما به‌عنوان «انجام‌شده» تأیید شد:`,
      ],
      callout: {
        tone: 'success',
        text: `«${args.taskTitle}»`,
      },
      closing: [
        'تبریک! یک قدم به هدف نزدیک‌تر شدید.',
      ],
      button: { label: 'ادامه‌ی مسیر', url: DASHBOARD_URL },
    }),
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
  return send({
    kind: 'task.blocked',
    recipientUserId: args.userId,
    recipientEmail: args.userEmail,
    applicationId: args.applicationId,
    subject: `نیاز به اقدام: ${args.taskTitle}`,
    html: renderEmail({
      preheader: `یک گام در پرونده‌ی شما منتظر اقدام شماست`,
      heading: 'یک گام نیاز به توجه دارد',
      paragraphs: [
        `گام زیر در پرونده‌ی «${args.applicationTitle}» به‌عنوان «منتظر اقدام شما» علامت‌گذاری شد:`,
      ],
      callout: {
        tone: 'warn',
        text: `«${args.taskTitle}»`,
      },
      closing: [
        'برای دیدن توضیحات مشاور و انجام اقدام لازم، وارد پنل خود شوید.',
      ],
      button: { label: 'مشاهده پنل من', url: DASHBOARD_URL },
    }),
  });
}
