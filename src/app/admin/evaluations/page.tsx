'use client';

import { useEffect, useState } from 'react';

type Pref = { university?: string; field?: string; degree?: string };
type Evaluation = {
  id: string;
  status: 'NEW' | 'REVIEWING' | 'CONTACTED' | 'CLOSED';
  fullName: string;
  gender?: string | null;
  maritalStatus?: string | null;
  birthDate?: string | null;
  militaryStatus?: string | null;
  hasChildUnder18: boolean;
  mobile: string;
  phone?: string | null;
  email: string;
  province?: string | null;
  germanLevel?: string | null;
  hasIelts: boolean;
  ieltsScore?: string | null;
  hasToefl: boolean;
  toeflScore?: string | null;
  diplomaField?: string | null;
  diplomaGpa?: string | null;
  lastDegree?: string | null;
  bachelorUniversity?: string | null;
  bachelorField?: string | null;
  bachelorGpa?: string | null;
  targetDegree?: string | null;
  targetPreferences?: Pref[] | null;
  jobTitle?: string | null;
  workExperienceYears?: string | null;
  currentlyEmployed: boolean;
  howFoundUs?: string | null;
  referralCode?: string | null;
  description?: string | null;
  adminNotes?: string | null;
  createdAt: string;
};

const STATUS_LABEL: Record<Evaluation['status'], string> = {
  NEW: 'جدید', REVIEWING: 'در حال بررسی', CONTACTED: 'تماس گرفته شد', CLOSED: 'بسته شده',
};

export default function AdminEvaluationsPage() {
  const [items, setItems] = useState<Evaluation[]>([]);
  const [status, setStatus] = useState('NEW');
  const [openId, setOpenId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/evaluations?status=${status}`);
    const data = await res.json();
    setItems(data.evaluations ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [status]);

  const updateStatus = async (id: string, s: Evaluation['status']) => {
    await fetch(`/api/admin/evaluations/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: s }),
    });
    load();
  };

  const saveNotes = async (id: string) => {
    await fetch(`/api/admin/evaluations/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminNotes: notes[id] ?? '' }),
    });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('حذف این فرم ارزیابی؟')) return;
    await fetch(`/api/admin/evaluations/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">فرم‌های ارزیابی</h1>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-lg px-3 py-2">
          <option value="NEW">جدید</option>
          <option value="REVIEWING">در حال بررسی</option>
          <option value="CONTACTED">تماس گرفته شد</option>
          <option value="CLOSED">بسته شده</option>
        </select>
      </div>

      {loading ? <p>...</p> : (
        <div className="space-y-4">
          {items.length === 0 && <p className="text-gray-500">فرمی وجود ندارد.</p>}
          {items.map((ev) => (
            <div key={ev.id} className="bg-white rounded-2xl shadow p-5">
              <div className="flex justify-between items-start cursor-pointer" onClick={() => setOpenId(openId === ev.id ? null : ev.id)}>
                <div>
                  <h3 className="font-bold text-lg">{ev.fullName}</h3>
                  <p className="text-sm text-gray-600">{ev.email} | {ev.mobile}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(ev.createdAt).toLocaleString()}</p>
                </div>
                <span className="bg-gray-100 px-3 py-1 rounded text-sm">{STATUS_LABEL[ev.status]}</span>
              </div>

              {openId === ev.id && (
                <div className="mt-4 pt-4 border-t space-y-4 text-sm">
                  <Group title="مشخصات فردی">
                    <Row label="جنسیت" value={ev.gender === 'MALE' ? 'مرد' : ev.gender === 'FEMALE' ? 'زن' : '-'} />
                    <Row label="وضعیت تاهل" value={ev.maritalStatus === 'SINGLE' ? 'مجرد' : ev.maritalStatus === 'MARRIED' ? 'متاهل' : '-'} />
                    <Row label="تاریخ تولد" value={ev.birthDate ?? '-'} />
                    <Row label="خدمت سربازی" value={ev.militaryStatus ?? '-'} />
                    <Row label="فرزند زیر ۱۸" value={ev.hasChildUnder18 ? 'بله' : 'خیر'} />
                    <Row label="استان" value={ev.province ?? '-'} />
                    <Row label="تلفن ثابت" value={ev.phone ?? '-'} />
                  </Group>

                  <Group title="دانش زبان">
                    <Row label="آلمانی" value={ev.germanLevel ?? '-'} />
                    <Row label="آیلتس" value={ev.hasIelts ? (ev.ieltsScore ?? 'دارد') : 'ندارد'} />
                    <Row label="تافل" value={ev.hasToefl ? (ev.toeflScore ?? 'دارد') : 'ندارد'} />
                  </Group>

                  <Group title="سوابق تحصیلی">
                    <Row label="رشته دیپلم" value={ev.diplomaField ?? '-'} />
                    <Row label="معدل دیپلم" value={ev.diplomaGpa ?? '-'} />
                    <Row label="آخرین مدرک" value={ev.lastDegree ?? '-'} />
                    <Row label="دانشگاه کارشناسی" value={ev.bachelorUniversity ?? '-'} />
                    <Row label="رشته کارشناسی" value={ev.bachelorField ?? '-'} />
                    <Row label="معدل کارشناسی" value={ev.bachelorGpa ?? '-'} />
                    <Row label="مقطع هدف" value={ev.targetDegree ?? '-'} />
                  </Group>

                  {ev.targetPreferences && ev.targetPreferences.length > 0 && (
                    <Group title="اولویت‌های دانشگاه/رشته">
                      {ev.targetPreferences.map((p, i) => (
                        <Row key={i} label={`اولویت ${i + 1}`} value={`${p.university ?? '-'} | ${p.field ?? '-'} | ${p.degree ?? '-'}`} />
                      ))}
                    </Group>
                  )}

                  <Group title="سوابق شغلی">
                    <Row label="عنوان شغلی" value={ev.jobTitle ?? '-'} />
                    <Row label="سابقه کار" value={ev.workExperienceYears ?? '-'} />
                    <Row label="شاغل" value={ev.currentlyEmployed ? 'بله' : 'خیر'} />
                  </Group>

                  <Group title="اطلاعات تکمیلی">
                    <Row label="نحوه آشنایی" value={ev.howFoundUs ?? '-'} />
                    <Row label="کد معرف" value={ev.referralCode ?? '-'} />
                  </Group>
                  {ev.description && (
                    <div>
                      <p className="font-medium mb-1">توضیحات:</p>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-wrap">{ev.description}</p>
                    </div>
                  )}

                  <div>
                    <p className="font-medium mb-1">یادداشت ادمین:</p>
                    <textarea
                      defaultValue={ev.adminNotes ?? ''}
                      onChange={(e) => setNotes({ ...notes, [ev.id]: e.target.value })}
                      rows={2} className="w-full border rounded p-2"
                    />
                    <button onClick={() => saveNotes(ev.id)} className="mt-1 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">
                      ذخیره یادداشت
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(['NEW', 'REVIEWING', 'CONTACTED', 'CLOSED'] as const)
                      .filter((s) => s !== ev.status)
                      .map((s) => (
                        <button key={s} onClick={() => updateStatus(ev.id, s)} className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm">
                          → {STATUS_LABEL[s]}
                        </button>
                      ))}
                    <button onClick={() => remove(ev.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm mr-auto">حذف</button>
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

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="font-bold text-gray-800 mb-2">{title}</p>
      <div className="grid md:grid-cols-2 gap-x-6 gap-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-500">{label}:</span>
      <span className="text-gray-800 font-medium">{value}</span>
    </div>
  );
}
