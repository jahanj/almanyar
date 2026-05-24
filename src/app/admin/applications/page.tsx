'use client';

import { useEffect, useState } from 'react';
import NotifyCustomerButton from '@/components/admin/NotifyCustomerButton';

type Doc = {
  id: string; category: string; status: 'PENDING' | 'APPROVED' | 'REJECTED';
  originalName: string; mimeType: string; size: number; reviewNote?: string | null; createdAt: string;
};
type Application = {
  id: string; type: string; status: string; title: string; adminNotes?: string | null;
  lastNotifiedAt?: string | null;
  createdAt: string;
  user: { name: string; email: string; phone?: string | null };
  documents: Doc[];
};

const APP_STATUSES = ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_REQUESTED', 'APPROVED', 'REJECTED', 'COMPLETED'];
const APP_LABEL: Record<string, string> = {
  DRAFT: 'پیش‌نویس', SUBMITTED: 'ثبت‌شده', UNDER_REVIEW: 'در حال بررسی',
  DOCUMENTS_REQUESTED: 'نیاز به مدارک', APPROVED: 'تایید شده', REJECTED: 'رد شده', COMPLETED: 'تکمیل شده',
};
const TYPE_LABEL: Record<string, string> = {
  STUDENT_GERMANY: 'تحصیل آلمان', STUDENT_TURKEY: 'اقامت ترکیه', AUSBILDUNG: 'اوسبیلدونگ', OTHER: 'سایر',
};
const DOC_LABEL: Record<string, string> = {
  PASSPORT: 'پاسپورت', DIPLOMA: 'دیپلم', TRANSCRIPT: 'ریزنمرات', LANGUAGE_CERTIFICATE: 'مدرک زبان',
  PHOTO: 'عکس', FINANCIAL_PROOF: 'تمکن مالی', RESUME: 'رزومه', MOTIVATION_LETTER: 'انگیزه‌نامه',
  ACCEPTANCE_LETTER: 'نامه پذیرش', INSURANCE: 'بیمه', OTHER: 'سایر',
};
const fmtSize = (b: number) => (b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [status, setStatus] = useState('SUBMITTED');
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  // Phase-4 §4 — track unsaved adminNotes text so NotifyCustomerButton
  // can send the latest value without requiring a prior save.
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/applications?status=${status}`);
    const data = await res.json();
    setApps(data.applications ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [status]);

  const setAppStatus = async (id: string, s: string) => {
    await fetch(`/api/admin/applications/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: s }),
    });
    load();
  };
  const saveNotes = async (id: string, notes: string) => {
    await fetch(`/api/admin/applications/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminNotes: notes }),
    });
    load();
  };
  const reviewDoc = async (id: string, s: string, note?: string) => {
    await fetch(`/api/admin/documents/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: s, reviewNote: note ?? null }),
    });
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">پرونده‌ها و مدارک</h1>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-lg px-3 py-2">
          {APP_STATUSES.map((s) => <option key={s} value={s}>{APP_LABEL[s]}</option>)}
        </select>
      </div>

      {loading ? <p>...</p> : apps.length === 0 ? <p className="text-gray-500">پرونده‌ای وجود ندارد.</p> : (
        <div className="space-y-4">
          {apps.map((app) => (
            <div key={app.id} className="bg-white rounded-2xl shadow p-5">
              <div className="flex justify-between items-start cursor-pointer flex-wrap gap-2" onClick={() => setOpenId(openId === app.id ? null : app.id)}>
                <div>
                  <h3 className="font-bold text-lg">{app.title}</h3>
                  <p className="text-sm text-gray-600">{app.user.name} · {app.user.email} {app.user.phone && `· ${app.user.phone}`}</p>
                  <p className="text-xs text-gray-400 mt-1">{TYPE_LABEL[app.type]} · {app.documents.length} مدرک · {new Date(app.createdAt).toLocaleString('fa-IR')}</p>
                </div>
                <span className="bg-gray-100 px-3 py-1 rounded text-sm">{APP_LABEL[app.status]}</span>
              </div>

              {openId === app.id && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  {/* Documents */}
                  <div className="space-y-2">
                    {app.documents.length === 0 && <p className="text-sm text-gray-400">مدرکی بارگذاری نشده.</p>}
                    {app.documents.map((d) => (
                      <div key={d.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <span className="font-medium">📄 {DOC_LABEL[d.category]} — {d.originalName} <span className="text-xs text-gray-400">({fmtSize(d.size)})</span></span>
                          <div className="flex items-center gap-2">
                            <a href={`/api/documents/${d.id}/file`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">مشاهده</a>
                            <span className={d.status === 'APPROVED' ? 'text-green-600' : d.status === 'REJECTED' ? 'text-red-600' : 'text-amber-600'}>
                              {d.status === 'APPROVED' ? 'تایید' : d.status === 'REJECTED' ? 'رد' : 'در انتظار'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => reviewDoc(d.id, 'APPROVED')} className="bg-green-600 text-white px-3 py-1 rounded text-xs">تایید</button>
                          <button onClick={() => { const n = prompt('دلیل رد (اختیاری):') ?? undefined; reviewDoc(d.id, 'REJECTED', n); }} className="bg-red-600 text-white px-3 py-1 rounded text-xs">رد</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Admin notes */}
                  <div>
                    <p className="text-sm font-medium mb-1">پیام به کاربر:</p>
                    <textarea
                      defaultValue={app.adminNotes ?? ''}
                      onChange={(e) => setNotes({ ...notes, [app.id]: e.target.value })}
                      onBlur={(e) => { if (e.target.value !== (app.adminNotes ?? '')) saveNotes(app.id, e.target.value); }}
                      rows={2} className="w-full border rounded p-2 text-sm"
                      placeholder="مثلاً: لطفاً ریزنمرات را هم بارگذاری کنید."
                    />
                    <div className="mt-2">
                      <NotifyCustomerButton
                        apiPath={`/api/admin/applications/${app.id}/notify`}
                        unsavedMessage={notes[app.id]}
                        lastNotifiedAt={app.lastNotifiedAt}
                        onSent={load}
                      />
                    </div>
                  </div>

                  {/* Status change */}
                  <div className="flex flex-wrap gap-2">
                    {APP_STATUSES.filter((s) => s !== app.status).map((s) => (
                      <button key={s} onClick={() => setAppStatus(app.id, s)} className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm">
                        → {APP_LABEL[s]}
                      </button>
                    ))}
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
