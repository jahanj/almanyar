'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import RoadmapTimeline, { type Task } from './RoadmapTimeline';

type Doc = {
  id: string;
  category: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  originalName: string;
  mimeType: string;
  size: number;
  reviewNote?: string | null;
  createdAt: string;
};

type Application = {
  id: string;
  type: string;
  status: string;
  title: string;
  adminNotes?: string | null;
  createdAt: string;
  documents: Doc[];
  tasks?: Task[];
};

const APP_TYPE_LABEL: Record<string, string> = {
  STUDENT_GERMANY: 'تحصیل در آلمان',
  STUDENT_TURKEY: 'اقامت تحصیلی ترکیه',
  AUSBILDUNG: 'اوسبیلدونگ',
  OTHER: 'سایر',
};

const APP_STATUS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'پیش‌نویس', color: 'bg-gray-200 text-gray-700' },
  SUBMITTED: { label: 'ثبت‌شده', color: 'bg-blue-100 text-blue-700' },
  UNDER_REVIEW: { label: 'در حال بررسی', color: 'bg-amber-100 text-amber-700' },
  DOCUMENTS_REQUESTED: { label: 'نیاز به مدارک', color: 'bg-orange-100 text-orange-700' },
  APPROVED: { label: 'تایید شده', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'رد شده', color: 'bg-red-100 text-red-700' },
  COMPLETED: { label: 'تکمیل شده', color: 'bg-emerald-100 text-emerald-700' },
};

const DOC_STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'در انتظار بررسی', color: 'text-amber-600' },
  APPROVED: { label: 'تایید شده', color: 'text-green-600' },
  REJECTED: { label: 'رد شده', color: 'text-red-600' },
};

const DOC_CATEGORIES = [
  { value: 'PASSPORT', label: 'پاسپورت' },
  { value: 'DIPLOMA', label: 'دیپلم / مدرک تحصیلی' },
  { value: 'TRANSCRIPT', label: 'ریزنمرات' },
  { value: 'LANGUAGE_CERTIFICATE', label: 'مدرک زبان' },
  { value: 'PHOTO', label: 'عکس' },
  { value: 'FINANCIAL_PROOF', label: 'تمکن مالی' },
  { value: 'RESUME', label: 'رزومه' },
  { value: 'MOTIVATION_LETTER', label: 'انگیزه‌نامه' },
  { value: 'ACCEPTANCE_LETTER', label: 'نامه پذیرش' },
  { value: 'INSURANCE', label: 'بیمه' },
  { value: 'OTHER', label: 'سایر' },
];

const catLabel = (v: string) => DOC_CATEGORIES.find((c) => c.value === v)?.label ?? v;
const fmtSize = (b: number) => (b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

export default function DashboardClient() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newType, setNewType] = useState('STUDENT_GERMANY');
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/applications');
    const data = await res.json();
    setApps(data.applications ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const createApp = async () => {
    setError(null);
    if (newTitle.trim().length < 2) { setError('عنوان پرونده را وارد کنید'); return; }
    const res = await fetch('/api/applications', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: newType, title: newTitle }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'خطا'); return; }
    setCreating(false);
    setNewTitle('');
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">پرونده‌های من</h1>
          <p className="text-gray-500 mt-1">مدارک خود را بارگذاری کنید و وضعیت پرونده را دنبال کنید</p>
        </div>
        <button onClick={() => setCreating(!creating)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium">
          + پرونده جدید
        </button>
      </div>

      {creating && (
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h3 className="font-bold mb-4">ایجاد پرونده جدید</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">نوع پرونده</label>
              <select value={newType} onChange={(e) => setNewType(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                {Object.entries(APP_TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">عنوان پرونده</label>
              <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="مثلاً: کارشناسی ارشد کامپیوتر" className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
          <div className="flex gap-3 mt-4">
            <button onClick={createApp} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg">ایجاد</button>
            <button onClick={() => setCreating(false)} className="border px-5 py-2 rounded-lg">انصراف</button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">در حال بارگذاری...</p>
      ) : apps.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-500">
          هنوز پرونده‌ای ندارید. با دکمه «پرونده جدید» شروع کنید.
        </div>
      ) : (
        <div className="space-y-6">
          {apps.map((app) => (
            <ApplicationCard key={app.id} app={app} onChange={load} />
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationCard({ app, onChange }: { app: Application; onChange: () => void }) {
  const [category, setCategory] = useState('PASSPORT');
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const st = APP_STATUS[app.status] ?? APP_STATUS.SUBMITTED!;

  const upload = async (file: File) => {
    setUploading(true);
    setMsg(null);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('category', category);
    fd.append('applicationId', app.id);
    const res = await fetch('/api/documents', { method: 'POST', body: fd });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) { setMsg(data.error ?? 'خطا در آپلود'); return; }
    onChange();
  };

  const removeDoc = async (id: string) => {
    if (!confirm('حذف این مدرک؟')) return;
    await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    onChange();
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-bold text-lg text-gray-800">{app.title}</h3>
          <p className="text-sm text-gray-500">{APP_TYPE_LABEL[app.type]} · {new Date(app.createdAt).toLocaleDateString('fa-IR')}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${st.color}`}>{st.label}</span>
      </div>

      {app.adminNotes && (
        <div className="bg-amber-50 border-r-4 border-amber-400 rounded-lg p-3 mb-4 text-sm text-amber-800">
          📋 پیام کارشناس: {app.adminNotes}
        </div>
      )}

      {/* Roadmap — Phase 5 co-managed panel */}
      {app.tasks !== undefined && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm text-gray-700">
              پنل گام‌های شما
              {app.tasks.length > 0 && (
                <span className="text-xs text-gray-500 font-normal mr-2">
                  ({app.tasks.filter((t) => t.adminTicked).length} از {app.tasks.length} گام تأیید شده)
                </span>
              )}
            </h4>
            <Link
              href={`/dashboard/cases/${app.id}`}
              className="text-xs text-blue-600 hover:underline"
            >
              مشاهده پنل کامل →
            </Link>
          </div>
          <RoadmapTimeline applicationId={app.id} tasks={app.tasks} onChange={onChange} />
        </div>
      )}

      {/* Documents */}
      <div className="space-y-2 mb-4">
        {app.documents.length === 0 && <p className="text-sm text-gray-400">هنوز مدرکی بارگذاری نشده.</p>}
        {app.documents.map((d) => {
          const ds = DOC_STATUS[d.status]!;
          return (
            <div key={d.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 text-sm flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span>📄</span>
                <div>
                  <p className="font-medium text-gray-800">{catLabel(d.category)} — {d.originalName}</p>
                  <p className="text-xs text-gray-400">{fmtSize(d.size)} · <span className={ds.color}>{ds.label}</span></p>
                  {d.reviewNote && <p className="text-xs text-red-600 mt-0.5">یادداشت: {d.reviewNote}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a href={`/api/documents/${d.id}/file`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">مشاهده</a>
                {d.status === 'PENDING' && (
                  <button onClick={() => removeDoc(d.id)} className="text-red-600 hover:underline">حذف</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload */}
      <div className="border-t pt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">نوع مدرک</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            {DOC_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm cursor-pointer">
          {uploading ? 'در حال آپلود...' : '📎 بارگذاری فایل'}
          <input
            type="file"
            className="hidden"
            disabled={uploading}
            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }}
          />
        </label>
        <span className="text-xs text-gray-400">حداکثر ۱۰ مگابایت — PDF/JPG/PNG/DOCX</span>
        {msg && <span className="text-red-600 text-sm">{msg}</span>}
      </div>
    </div>
  );
}
