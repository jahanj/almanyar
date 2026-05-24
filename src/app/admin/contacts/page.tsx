'use client';

import { useEffect, useState } from 'react';
import NotifyCustomerButton from '@/components/admin/NotifyCustomerButton';

type Contact = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  serviceType?: string | null;
  status: 'NEW' | 'IN_PROGRESS' | 'ANSWERED' | 'ARCHIVED';
  adminNotes?: string | null;
  lastNotifiedAt?: string | null;
  createdAt: string;
};

const STATUS_LABEL: Record<Contact['status'], string> = {
  NEW: 'جدید',
  IN_PROGRESS: 'در حال پیگیری',
  ANSWERED: 'پاسخ داده شده',
  ARCHIVED: 'بایگانی',
};

export default function AdminContactsPage() {
  const [items, setItems] = useState<Contact[]>([]);
  const [status, setStatus] = useState<string>('NEW');
  const [openId, setOpenId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/contacts?status=${status}`);
    const data = await res.json();
    setItems(data.requests ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [status]);

  const updateStatus = async (id: string, newStatus: Contact['status']) => {
    await fetch(`/api/admin/contacts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    load();
  };

  const saveNotes = async (id: string) => {
    await fetch(`/api/admin/contacts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminNotes: notes[id] ?? '' }),
    });
    load();
  };


  const remove = async (id: string) => {
    if (!confirm('حذف این درخواست؟')) return;
    await fetch(`/api/admin/contacts/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">مدیریت درخواست‌ها</h1>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="NEW">جدید</option>
          <option value="IN_PROGRESS">در حال پیگیری</option>
          <option value="ANSWERED">پاسخ داده شده</option>
          <option value="ARCHIVED">بایگانی</option>
        </select>
      </div>

      {loading ? <p>...</p> : (
        <div className="space-y-4">
          {items.length === 0 && <p className="text-gray-500">درخواستی وجود ندارد.</p>}
          {items.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl shadow p-5">
              <div className="flex justify-between items-start cursor-pointer"
                   onClick={() => setOpenId(openId === c.id ? null : c.id)}>
                <div>
                  <h3 className="font-bold text-lg">{c.fullName}</h3>
                  <p className="text-sm text-gray-600">{c.email} {c.phone && `| ${c.phone}`}</p>
                  {c.subject && <p className="text-sm mt-1 font-medium">موضوع: {c.subject}</p>}
                  <p className="text-xs text-gray-400 mt-1">{new Date(c.createdAt).toLocaleString()}</p>
                </div>
                <span className="bg-gray-100 px-3 py-1 rounded text-sm">
                  {STATUS_LABEL[c.status]}
                </span>
              </div>

              {openId === c.id && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">پیام:</p>
                    <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">{c.message}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">یادداشت ادمین:</p>
                    <textarea
                      defaultValue={c.adminNotes ?? ''}
                      onChange={(e) => setNotes({ ...notes, [c.id]: e.target.value })}
                      rows={2}
                      className="w-full border rounded p-2 text-sm"
                    />
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => saveNotes(c.id)}
                        className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                      >ذخیره یادداشت</button>
                      <NotifyCustomerButton
                        apiPath={`/api/admin/contacts/${c.id}/notify`}
                        unsavedMessage={notes[c.id]}
                        lastNotifiedAt={c.lastNotifiedAt}
                        onSent={load}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(['NEW', 'IN_PROGRESS', 'ANSWERED', 'ARCHIVED'] as const)
                      .filter((s) => s !== c.status)
                      .map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(c.id, s)}
                          className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
                        >→ {STATUS_LABEL[s]}</button>
                      ))}
                    <button
                      onClick={() => remove(c.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm mr-auto"
                    >حذف</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
