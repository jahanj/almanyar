'use client';

import { useState } from 'react';

export type AdminTask = {
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

const TASK_CATEGORIES = [
  { value: 'UNIVERSITY_REGISTRATION', label: 'ثبت‌نام دانشگاه' },
  { value: 'RESIDENCE_PERMIT', label: 'اقامت' },
  { value: 'HEALTH_INSURANCE', label: 'بیمه درمانی' },
  { value: 'BANK_ACCOUNT', label: 'افتتاح حساب' },
  { value: 'SPERRKONTO', label: 'حساب مسدودی' },
  { value: 'MONEY_TRANSFER', label: 'انتقال وجه' },
  { value: 'DOCUMENT_TRANSLATION', label: 'ترجمه مدارک' },
  { value: 'EMBASSY_APPOINTMENT', label: 'نوبت سفارت' },
  { value: 'OTHER', label: 'سایر' },
];

const TASK_STATUSES = [
  { value: 'PENDING',     label: 'در انتظار' },
  { value: 'IN_PROGRESS', label: 'در حال انجام' },
  { value: 'DONE',        label: 'انجام شد' },
  { value: 'BLOCKED',     label: 'منتظر اقدام کاربر' },
] as const;

/**
 * Phase-5 TASK-06 — owner-side roadmap editor.
 *
 * Inline add / edit / delete + up-down reorder buttons. Drag-and-drop
 * was rejected for scope (no extra deps); arrows are sufficient for
 * the volume expected.
 *
 * Reorder calls PATCH /api/admin/tasks/reorder with the full new
 * order so we don't have to compute deltas client-side. Add/edit/delete
 * each call their own endpoint, then trigger onChange() so the parent
 * re-loads from /api/admin/applications (single source of truth).
 */
export default function AdminTaskEditor({
  applicationId,
  tasks,
  onChange,
}: {
  applicationId: string;
  tasks: AdminTask[];
  onChange: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('OTHER');
  const [newDesc, setNewDesc] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const sorted = [...tasks].sort((a, b) => a.order - b.order);

  const addTask = async () => {
    if (newTitle.trim().length < 1) return;
    setBusy('add');
    try {
      const res = await fetch(`/api/admin/applications/${applicationId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          category: newCategory,
          description: newDesc.trim() || null,
        }),
      });
      if (!res.ok) {
        alert('خطا در افزودن گام');
        return;
      }
      setNewTitle('');
      setNewDesc('');
      setAdding(false);
      onChange();
    } finally {
      setBusy(null);
    }
  };

  const patchTask = async (id: string, payload: Record<string, unknown>) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        alert('خطا در ویرایش');
        return;
      }
      onChange();
    } finally {
      setBusy(null);
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm('این گام حذف شود؟')) return;
    setBusy(id);
    try {
      await fetch(`/api/admin/tasks/${id}`, { method: 'DELETE' });
      onChange();
    } finally {
      setBusy(null);
    }
  };

  const move = async (id: string, dir: -1 | 1) => {
    const idx = sorted.findIndex((t) => t.id === id);
    const swapIdx = idx + dir;
    if (idx < 0 || swapIdx < 0 || swapIdx >= sorted.length) return;
    const next = [...sorted];
    [next[idx]!, next[swapIdx]!] = [next[swapIdx]!, next[idx]!];
    const items = next.map((t, i) => ({ id: t.id, order: i }));

    setBusy(id);
    try {
      const res = await fetch('/api/admin/tasks/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, items }),
      });
      if (!res.ok) {
        alert('خطا در جابجایی');
        return;
      }
      onChange();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="bg-blue-50/40 border border-blue-100 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-sm text-blue-900">پنل گام‌های کاربر</h4>
        <button
          type="button"
          onClick={() => setAdding(!adding)}
          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
        >
          {adding ? 'انصراف' : '+ گام جدید'}
        </button>
      </div>

      {adding && (
        <div className="bg-white border rounded-lg p-3 mb-3 space-y-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="عنوان گام (مثلاً: افتتاح حساب مسدودی)"
            className="w-full border rounded px-2 py-1.5 text-sm"
          />
          <textarea
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="توضیح (اختیاری)"
            rows={2}
            className="w-full border rounded px-2 py-1.5 text-sm"
          />
          <div className="flex items-center gap-2">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              {TASK_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <button
              type="button"
              onClick={addTask}
              disabled={busy === 'add' || newTitle.trim().length < 1}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-3 py-1.5 rounded text-sm"
            >
              {busy === 'add' ? '...' : 'افزودن'}
            </button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-3">
          هنوز گامی برای این پرونده تعریف نشده.
        </p>
      ) : (
        <ol className="space-y-2">
          {sorted.map((task, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === sorted.length - 1;
            const isEditing = editingId === task.id;

            return (
              <li
                key={task.id}
                className={`bg-white border rounded-lg p-3 ${task.adminTicked ? 'border-emerald-200' : task.status === 'BLOCKED' ? 'border-amber-200' : ''}`}
              >
                <div className="flex items-start gap-2">
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => move(task.id, -1)}
                      disabled={isFirst || busy === task.id}
                      className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
                      title="بالا"
                    >▲</button>
                    <button
                      type="button"
                      onClick={() => move(task.id, 1)}
                      disabled={isLast || busy === task.id}
                      className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
                      title="پایین"
                    >▼</button>
                  </div>

                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <EditForm
                        task={task}
                        onCancel={() => setEditingId(null)}
                        onSave={async (payload) => {
                          await patchTask(task.id, payload);
                          setEditingId(null);
                        }}
                      />
                    ) : (
                      <>
                        <p className="font-medium text-sm text-gray-800">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-gray-500 mt-0.5 whitespace-pre-wrap">{task.description}</p>
                        )}
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                          <span>{TASK_CATEGORIES.find((c) => c.value === task.category)?.label}</span>
                          {task.studentTicked && !task.adminTicked && (
                            <span className="text-amber-700">⏳ کاربر اعلام انجام کرد — منتظر تأیید شما</span>
                          )}
                        </div>
                      </>
                    )}

                    {!isEditing && (
                      <div className="mt-2 flex items-center gap-3 flex-wrap text-xs">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={task.adminTicked}
                            disabled={busy === task.id}
                            onChange={() => patchTask(task.id, { adminTicked: !task.adminTicked })}
                            className="h-4 w-4 rounded border-gray-300 text-emerald-600"
                            data-testid={`admin-tick-${task.id}`}
                          />
                          <span>تأیید انجام (DONE)</span>
                        </label>
                        <select
                          value={task.status}
                          disabled={busy === task.id}
                          onChange={(e) => patchTask(task.id, { status: e.target.value })}
                          className="border rounded px-1.5 py-0.5"
                        >
                          {TASK_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        <button
                          type="button"
                          onClick={() => setEditingId(task.id)}
                          className="text-blue-600 hover:underline"
                        >ویرایش</button>
                        <button
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          disabled={busy === task.id}
                          className="text-red-600 hover:underline"
                        >حذف</button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function EditForm({
  task,
  onSave,
  onCancel,
}: {
  task: AdminTask;
  onSave: (payload: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [category, setCategory] = useState(task.category);

  return (
    <div className="space-y-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border rounded px-2 py-1 text-sm"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="w-full border rounded px-2 py-1 text-sm"
      />
      <div className="flex items-center gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          {TASK_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <button
          type="button"
          onClick={() => onSave({
            title: title.trim(),
            description: description.trim() || null,
            category,
          })}
          disabled={title.trim().length < 1}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-3 py-1 rounded text-xs"
        >ذخیره</button>
        <button
          type="button"
          onClick={onCancel}
          className="border px-3 py-1 rounded text-xs"
        >انصراف</button>
      </div>
    </div>
  );
}
