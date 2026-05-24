import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';
import { notifyCustomer } from '@/lib/mailer';

/**
 * Phase-4 §4 — shared handler for /api/admin/<table>/[id]/notify.
 *
 * One body shape, three lead tables. Optional `message` overrides
 * the stored `adminNotes`; otherwise we send adminNotes verbatim.
 *
 * Rate limit: at most 3 notifications per lead per day. Enforced by
 * counting AdminEmailLog rows from the last 24h for this (leadType,
 * leadId). Owner is unlikely to hit this in normal use; it's a
 * defensive cap.
 *
 * Writes an AdminEmailLog row on every successful send (and updates
 * the lead's `lastNotifiedAt`). On SMTP failure the log row is NOT
 * written — caller sees a 502.
 */

const NotifyBody = z.object({
  message: z.string().max(5000).optional(),
});

type LeadKind = 'CONTACT' | 'EVALUATION' | 'APPLICATION';

type LeadView = {
  email: string;
  name: string;
  adminNotes: string | null;
  label: string; // human-readable in the email body
};

async function loadLead(kind: LeadKind, id: string): Promise<LeadView | null> {
  if (kind === 'CONTACT') {
    const row = await prisma.contactRequest.findUnique({ where: { id } });
    return row && {
      email: row.email,
      name: row.fullName,
      adminNotes: row.adminNotes,
      label: 'پرونده تماس',
    };
  }
  if (kind === 'EVALUATION') {
    const row = await prisma.evaluation.findUnique({ where: { id } });
    return row && {
      email: row.email,
      name: row.fullName,
      adminNotes: row.adminNotes,
      label: 'پرونده ارزیابی',
    };
  }
  // APPLICATION — owner is set on the User relation.
  const row = await prisma.application.findUnique({
    where: { id },
    include: { user: { select: { email: true, name: true } } },
  });
  return row && {
    email: row.user.email,
    name: row.user.name,
    adminNotes: row.adminNotes,
    label: 'پرونده مهاجرت',
  };
}

async function markNotified(kind: LeadKind, id: string) {
  const data = { lastNotifiedAt: new Date() };
  if (kind === 'CONTACT') return prisma.contactRequest.update({ where: { id }, data });
  if (kind === 'EVALUATION') return prisma.evaluation.update({ where: { id }, data });
  return prisma.application.update({ where: { id }, data });
}

export async function handleNotify(
  req: Request,
  kind: LeadKind,
  id: string,
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const parsed = NotifyBody.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const lead = await loadLead(kind, id);
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  const message = (parsed.data.message ?? lead.adminNotes ?? '').trim();
  if (!message) {
    return NextResponse.json(
      { error: 'یادداشتی برای ارسال وجود ندارد.' },
      { status: 400 },
    );
  }

  // Rate limit — 3 / lead / 24h. Defensive against a finger-slip on the
  // admin "send" button.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentCount = await prisma.adminEmailLog.count({
    where: { leadType: kind, leadId: id, sentAt: { gt: since } },
  });
  if (recentCount >= 3) {
    return NextResponse.json(
      { error: 'سقف ارسال روزانه برای این پرونده پر شده است (۳ بار در ۲۴ ساعت).' },
      { status: 429 },
    );
  }

  const subject = 'به‌روزرسانی پرونده شما — آلمانیار';
  const result = await notifyCustomer({
    to: lead.email,
    name: lead.name,
    message,
    leadLabel: lead.label,
  });

  if ('skipped' in result && result.skipped) {
    return NextResponse.json(
      { error: 'SMTP پیکربندی نشده است — ایمیل ارسال نشد.' },
      { status: 502 },
    );
  }

  await prisma.adminEmailLog.create({
    data: {
      leadType: kind,
      leadId: id,
      to: lead.email,
      subject,
      snippet: message.slice(0, 280),
      sentBy: guard.session?.user?.email ?? null,
    },
  });

  await markNotified(kind, id);

  return NextResponse.json({ ok: true });
}
