'use client';

import { useState } from 'react';

export type Task = {
  id: string;
  order: number;
  title: string;
  description?: string | null;
  category: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
  requiredDocCategory?: string | null;
  studentTicked: boolean;
  studentTickedAt?: string | null;
  adminTicked: boolean;
  adminTickedAt?: string | null;
  dueDate?: string | null;
};

const STATUS_META: Record<Task['status'], { label: string; ring: string; dot: string }> = {
  PENDING:     { label: 'در انتظار',     ring: 'ring-gray-200',     dot: 'bg-gray-300' },
  IN_PROGRESS: { label: 'در حال انجام',  ring: 'ring-blue-200',     dot: 'bg-blue-500' },
  DONE:        { label: 'انجام شد',       ring: 'ring-emerald-200',  dot: 'bg-emerald-500' },
  BLOCKED:     { label: 'منتظر اقدام شما', ring: 'ring-amber-200',    dot: 'bg-amber-500' },
};

const CATEGORY_LABEL: Record<string, string> = {
  UNIVERSITY_REGISTRATION: 'ثبت‌نام دانشگاه',
  RESIDENCE_PERMIT: 'اقامت',
  HEALTH_INSURANCE: 'بیمه درمانی',
  BANK_ACCOUNT: 'افتتاح حساب',
  SPERRKONTO: 'حساب مسدودی',
  MONEY_TRANSFER: 'انتقال وجه',
  DOCUMENT_TRANSLATION: 'ترجمه مدارک',
  EMBASSY_APPOINTMENT: 'نوبت سفارت',
  OTHER: 'سایر',
};

/**
 * Phase-5 TASK-05 — student view of the per-Application roadmap.
 *
 * Read-mostly: the student can only toggle their own "I did it" tick.
 * Status, BLOCKED, and the canonical DONE all stay in the admin's
 * hands per PHASE-5-PLAN §2.2 — the UI explicitly reflects that with
 * the "منتظر تأیید مشاور" caption after a student-tick.
 *
 * The tick fires POST .../student-tick and is idempotent server-side,
 * so a double-click is harmless.
 */
export default function RoadmapTimeline({
  applicationId,
  tasks,
  onChange,
}: {
  applicationId: string;
  tasks: Task[];
  onChange?: () => void;
}) {
  const [pending, setPending] = useState<string | null>(null);

  if (tasks.length === 0) {
    return (
      <div className="text-sm text-gray-400 bg-gray-50 rounded-lg p-4 text-center">
        مشاور شما هنوز گامی برای این پرونده تعریف نکرده. به‌زودی اطلاع‌رسانی می‌شود.
      </div>
    );
  }

  const toggle = async (task: Task) => {
    if (pending) return;
    const next = !task.studentTicked;
    setPending(task.id);
    try {
      const res = await fetch(`/api/applications/${applicationId}/tasks/${task.id}/student-tick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as { error?: string }));
        alert(data.error ?? 'خطا در ثبت');
        return;
      }
      onChange?.();
    } finally {
      setPending(null);
    }
  };

  return (
    <ol className="space-y-3" data-testid="roadmap-timeline">
      {tasks.map((task, idx) => {
        const meta = STATUS_META[task.status];
        const isLast = idx === tasks.length - 1;
        const checked = task.adminTicked || task.studentTicked;
        const awaitingAdmin = task.studentTicked && !task.adminTicked;

        return (
          <li key={task.id} className="relative flex gap-3">
            {!isLast && (
              <span
                className="absolute right-[11px] top-7 bottom-[-12px] w-px bg-gray-200"
                aria-hidden="true"
              />
            )}
            <span
              className={`mt-1 h-6 w-6 shrink-0 rounded-full ring-4 ${meta.ring} ${meta.dot} flex items-center justify-center text-white text-xs`}
              aria-hidden="true"
            >
              {task.adminTicked ? '✓' : task.studentTicked ? '·' : ''}
            </span>
            <div className={`flex-1 rounded-lg border p-3 ${task.adminTicked ? 'bg-emerald-50 border-emerald-100' : task.status === 'BLOCKED' ? 'bg-amber-50 border-amber-100' : 'bg-white border-gray-200'}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-medium text-gray-800">{task.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {CATEGORY_LABEL[task.category] ?? task.category}
                    {task.dueDate && (
                      <> · مهلت: {new Date(task.dueDate).toLocaleDateString('fa-IR')}</>
                    )}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  task.status === 'DONE' ? 'bg-emerald-100 text-emerald-700' :
                  task.status === 'BLOCKED' ? 'bg-amber-100 text-amber-800' :
                  task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {meta.label}
                </span>
              </div>

              {task.description && (
                <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{task.description}</p>
              )}

              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <label className={`inline-flex items-center gap-2 text-sm cursor-pointer ${task.adminTicked ? 'opacity-60 cursor-not-allowed' : ''}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={task.adminTicked || pending === task.id}
                    onChange={() => toggle(task)}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    data-testid={`student-tick-${task.id}`}
                  />
                  <span>این گام را انجام دادم</span>
                </label>
                {awaitingAdmin && (
                  <span className="text-xs text-amber-700">⏳ منتظر تأیید مشاور</span>
                )}
                {task.adminTicked && task.adminTickedAt && (
                  <span className="text-xs text-emerald-700">
                    ✓ تأیید مشاور: {new Date(task.adminTickedAt).toLocaleDateString('fa-IR')}
                  </span>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
