'use client';

import { useState } from 'react';

type Pref = { university: string; field: string; degree: string };

type FormState = {
  fullName: string;
  gender: string;
  maritalStatus: string;
  birthDate: string;
  militaryStatus: string;
  hasChildUnder18: boolean;
  mobile: string;
  phone: string;
  email: string;
  province: string;
  germanLevel: string;
  hasIelts: boolean;
  ieltsScore: string;
  hasToefl: boolean;
  toeflScore: string;
  diplomaField: string;
  diplomaGpa: string;
  lastDegree: string;
  bachelorUniversity: string;
  bachelorField: string;
  bachelorGpa: string;
  targetDegree: string;
  targetPreferences: Pref[];
  jobTitle: string;
  workExperienceYears: string;
  currentlyEmployed: boolean;
  howFoundUs: string;
  referralCode: string;
  description: string;
};

const initialState: FormState = {
  fullName: '', gender: '', maritalStatus: '', birthDate: '', militaryStatus: '',
  hasChildUnder18: false, mobile: '', phone: '', email: '', province: '',
  germanLevel: '', hasIelts: false, ieltsScore: '', hasToefl: false, toeflScore: '',
  diplomaField: '', diplomaGpa: '', lastDegree: '', bachelorUniversity: '',
  bachelorField: '', bachelorGpa: '', targetDegree: '', targetPreferences: [],
  jobTitle: '', workExperienceYears: '', currentlyEmployed: false,
  howFoundUs: '', referralCode: '', description: '',
};

const STEPS = [
  'مشخصات فردی',
  'دانش زبان',
  'سوابق تحصیلی',
  'سوابق شغلی',
  'اطلاعات تکمیلی',
];

const provinces = [
  'تهران', 'البرز', 'اصفهان', 'فارس', 'خراسان رضوی', 'آذربایجان شرقی',
  'آذربایجان غربی', 'خوزستان', 'مازندران', 'گیلان', 'کرمان', 'یزد', 'قم',
  'مرکزی', 'گلستان', 'همدان', 'کرمانشاه', 'سایر',
];

export default function EvaluationWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const addPref = () =>
    set('targetPreferences', [...form.targetPreferences, { university: '', field: '', degree: '' }]);

  const updatePref = (i: number, key: keyof Pref, value: string) => {
    const next = [...form.targetPreferences];
    next[i] = { ...next[i]!, [key]: value };
    set('targetPreferences', next);
  };

  const removePref = (i: number) =>
    set('targetPreferences', form.targetPreferences.filter((_, idx) => idx !== i));

  const validateStep = (): string | null => {
    if (step === 0) {
      if (form.fullName.trim().length < 2) return 'نام و نام خانوادگی را وارد کنید';
      if (!form.mobile.trim()) return 'شماره موبایل را وارد کنید';
      if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'ایمیل معتبر وارد کنید';
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const back = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...form,
        gender: form.gender || null,
        maritalStatus: form.maritalStatus || null,
        birthDate: form.birthDate || null,
        militaryStatus: form.militaryStatus || null,
        province: form.province || null,
        germanLevel: form.germanLevel || null,
        ieltsScore: form.ieltsScore || null,
        toeflScore: form.toeflScore || null,
        diplomaField: form.diplomaField || null,
        diplomaGpa: form.diplomaGpa || null,
        lastDegree: form.lastDegree || null,
        bachelorUniversity: form.bachelorUniversity || null,
        bachelorField: form.bachelorField || null,
        bachelorGpa: form.bachelorGpa || null,
        targetDegree: form.targetDegree || null,
        targetPreferences: form.targetPreferences.length ? form.targetPreferences : null,
        jobTitle: form.jobTitle || null,
        workExperienceYears: form.workExperienceYears || null,
        howFoundUs: form.howFoundUs || null,
        referralCode: form.referralCode || null,
        description: form.description || null,
      };
      const res = await fetch('/api/evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'خطا در ارسال فرم');
      setDone(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-2xl mx-auto">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold mb-3 text-gray-800">فرم ارزیابی شما ثبت شد</h2>
        <p className="text-gray-600 leading-8">
          کارشناسان ما شرایط شما را با دقت بررسی می‌کنند و نتیجه ارزیابی به‌زودی از طریق ایمیل
          برایتان ارسال می‌شود.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 max-w-4xl mx-auto">
      {/* Stepper */}
      <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 mb-10">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition
                ${i === step ? 'bg-blue-900 text-white' : i < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}
            >
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-sm ${i === step ? 'text-blue-900 font-bold' : 'text-gray-500'}`}>{label}</span>
          </div>
        ))}
      </div>

      {/* Step 1 — Personal */}
      {step === 0 && (
        <div className="space-y-8">
          <Section title="مشخصات فردی">
            <Grid>
              <Field label="نام و نام خانوادگی" required>
                <input className={inp} value={form.fullName} onChange={(e) => set('fullName', e.target.value)} />
              </Field>
              <Field label="جنسیت">
                <select className={inp} value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                  <option value="">انتخاب کنید</option>
                  <option value="MALE">مرد</option>
                  <option value="FEMALE">زن</option>
                </select>
              </Field>
              <Field label="وضعیت تاهل">
                <select className={inp} value={form.maritalStatus} onChange={(e) => set('maritalStatus', e.target.value)}>
                  <option value="">انتخاب کنید</option>
                  <option value="SINGLE">مجرد</option>
                  <option value="MARRIED">متاهل</option>
                </select>
              </Field>
              <Field label="تاریخ تولد">
                <input type="date" className={inp} value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} />
              </Field>
              {form.gender === 'MALE' && (
                <Field label="وضعیت خدمت سربازی">
                  <select className={inp} value={form.militaryStatus} onChange={(e) => set('militaryStatus', e.target.value)}>
                    <option value="">انتخاب کنید</option>
                    <option value="DONE">پایان خدمت</option>
                    <option value="EXEMPT">معافیت</option>
                    <option value="NOT_DONE">هنوز نرفته‌ام</option>
                    <option value="IN_PROGRESS">در حال خدمت</option>
                  </select>
                </Field>
              )}
              <Field label="آیا فرزند زیر ۱۸ سال دارید؟">
                <div className="flex gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={form.hasChildUnder18} onChange={() => set('hasChildUnder18', true)} /> بله
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={!form.hasChildUnder18} onChange={() => set('hasChildUnder18', false)} /> خیر
                  </label>
                </div>
              </Field>
            </Grid>
          </Section>

          <Section title="مشخصات تماس">
            <Grid>
              <Field label="تلفن همراه" required>
                <input className={inp} value={form.mobile} onChange={(e) => set('mobile', e.target.value)} />
              </Field>
              <Field label="تلفن ثابت">
                <input className={inp} value={form.phone} onChange={(e) => set('phone', e.target.value)} />
              </Field>
              <Field label="ایمیل" required>
                <input type="email" className={inp} value={form.email} onChange={(e) => set('email', e.target.value)} />
              </Field>
              <Field label="استان محل اقامت">
                <select className={inp} value={form.province} onChange={(e) => set('province', e.target.value)}>
                  <option value="">انتخاب کنید</option>
                  {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
            </Grid>
          </Section>
        </div>
      )}

      {/* Step 2 — Language */}
      {step === 1 && (
        <Section title="سطح دانش زبان">
          <Grid>
            <Field label="زبان آلمانی">
              <select className={inp} value={form.germanLevel} onChange={(e) => set('germanLevel', e.target.value)}>
                <option value="">انتخاب کنید</option>
                <option value="NONE">ندارم</option>
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
              </select>
            </Field>
            <Field label="زبان انگلیسی">
              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.hasIelts} onChange={(e) => set('hasIelts', e.target.checked)} /> دارای مدرک آیلتس
                </label>
                {form.hasIelts && (
                  <input className={inp} placeholder="نمره آیلتس (مثلاً 6.5)" value={form.ieltsScore} onChange={(e) => set('ieltsScore', e.target.value)} />
                )}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.hasToefl} onChange={(e) => set('hasToefl', e.target.checked)} /> دارای مدرک تافل
                </label>
                {form.hasToefl && (
                  <input className={inp} placeholder="نمره تافل" value={form.toeflScore} onChange={(e) => set('toeflScore', e.target.value)} />
                )}
              </div>
            </Field>
          </Grid>
        </Section>
      )}

      {/* Step 3 — Education */}
      {step === 2 && (
        <div className="space-y-8">
          <Section title="سوابق تحصیلی">
            <Grid>
              <Field label="رشته دیپلم">
                <input className={inp} value={form.diplomaField} onChange={(e) => set('diplomaField', e.target.value)} />
              </Field>
              <Field label="معدل دیپلم">
                <input className={inp} value={form.diplomaGpa} onChange={(e) => set('diplomaGpa', e.target.value)} />
              </Field>
              <Field label="آخرین مدرک تحصیلی">
                <select className={inp} value={form.lastDegree} onChange={(e) => set('lastDegree', e.target.value)}>
                  <option value="">انتخاب کنید</option>
                  <option value="DIPLOMA">دیپلم</option>
                  <option value="BACHELOR">کارشناسی</option>
                  <option value="MASTER">کارشناسی ارشد</option>
                  <option value="PHD">دکتری</option>
                </select>
              </Field>
              <Field label="نام دانشگاه مقطع کارشناسی">
                <input className={inp} value={form.bachelorUniversity} onChange={(e) => set('bachelorUniversity', e.target.value)} />
              </Field>
              <Field label="رشته تحصیلی مقطع کارشناسی">
                <input className={inp} value={form.bachelorField} onChange={(e) => set('bachelorField', e.target.value)} />
              </Field>
              <Field label="معدل مقطع کارشناسی">
                <input className={inp} value={form.bachelorGpa} onChange={(e) => set('bachelorGpa', e.target.value)} />
              </Field>
            </Grid>
          </Section>

          <Section title="دانشگاه و رشته مورد نظر در آلمان">
            <Field label="مقطع مورد نظر برای تحصیل در آلمان">
              <select className={inp} value={form.targetDegree} onChange={(e) => set('targetDegree', e.target.value)}>
                <option value="">انتخاب کنید</option>
                <option value="STUDIENKOLLEG">کالج (Studienkolleg)</option>
                <option value="BACHELOR">کارشناسی</option>
                <option value="MASTER">کارشناسی ارشد</option>
                <option value="PHD">دکتری</option>
                <option value="AUSBILDUNG">اوسبیلدونگ</option>
              </select>
            </Field>

            <p className="text-sm text-gray-600 mt-6 mb-3">دانشگاه و رشته مورد نظر خود را به ترتیب اولویت وارد کنید:</p>
            <div className="space-y-3">
              {form.targetPreferences.map((pref, i) => (
                <div key={i} className="grid md:grid-cols-3 gap-3 items-end bg-gray-50 p-3 rounded-xl relative">
                  <Field label="دانشگاه مورد نظر">
                    <input className={inp} value={pref.university} onChange={(e) => updatePref(i, 'university', e.target.value)} />
                  </Field>
                  <Field label="رشته مورد نظر">
                    <input className={inp} value={pref.field} onChange={(e) => updatePref(i, 'field', e.target.value)} />
                  </Field>
                  <div className="flex gap-2">
                    <Field label="مقطع">
                      <select className={inp} value={pref.degree} onChange={(e) => updatePref(i, 'degree', e.target.value)}>
                        <option value="">--</option>
                        <option value="BACHELOR">کارشناسی</option>
                        <option value="MASTER">ارشد</option>
                        <option value="PHD">دکتری</option>
                      </select>
                    </Field>
                    <button type="button" onClick={() => removePref(i)} className="mb-1 text-red-600 px-2 text-xl">×</button>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addPref} className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
              + افزودن رشته و مقطع
            </button>
          </Section>
        </div>
      )}

      {/* Step 4 — Work */}
      {step === 3 && (
        <Section title="سوابق شغلی">
          <Grid>
            <Field label="عنوان شغلی">
              <input className={inp} value={form.jobTitle} onChange={(e) => set('jobTitle', e.target.value)} />
            </Field>
            <Field label="سابقه کار (سال)">
              <input className={inp} value={form.workExperienceYears} onChange={(e) => set('workExperienceYears', e.target.value)} />
            </Field>
            <Field label="آیا در حال حاضر شاغل هستید؟">
              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={form.currentlyEmployed} onChange={() => set('currentlyEmployed', true)} /> بله
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={!form.currentlyEmployed} onChange={() => set('currentlyEmployed', false)} /> خیر
                </label>
              </div>
            </Field>
          </Grid>
        </Section>
      )}

      {/* Step 5 — Additional */}
      {step === 4 && (
        <Section title="اطلاعات تکمیلی">
          <Grid>
            <Field label="نحوه آشنایی با ما">
              <select className={inp} value={form.howFoundUs} onChange={(e) => set('howFoundUs', e.target.value)}>
                <option value="">انتخاب کنید</option>
                <option value="GOOGLE">جستجوی گوگل</option>
                <option value="INSTAGRAM">اینستاگرام</option>
                <option value="TELEGRAM">تلگرام</option>
                <option value="FRIEND">معرفی دوستان</option>
                <option value="OTHER">سایر</option>
              </select>
            </Field>
            <Field label="نام موسسه، فرد یا کد معرف">
              <input className={inp} value={form.referralCode} onChange={(e) => set('referralCode', e.target.value)} />
            </Field>
          </Grid>
          <Field label="توضیحات">
            <textarea className={inp} rows={5} placeholder="اگر نکته‌ای را می‌خواهید بگویید، اینجا بنویسید." value={form.description} onChange={(e) => set('description', e.target.value)} />
          </Field>
        </Section>
      )}

      {error && <p className="text-red-700 bg-red-50 p-3 rounded-lg mt-6 text-sm">{error}</p>}

      {/* Navigation */}
      <div className="flex justify-between items-center mt-10">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-40"
        >
          مرحله قبل
        </button>

        {step < STEPS.length - 1 ? (
          <button type="button" onClick={next} className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-2.5 rounded-lg font-medium">
            مرحله بعد
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={loading} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-8 py-2.5 rounded-lg font-medium">
            {loading ? 'در حال ارسال...' : 'ارسال فرم ارزیابی'}
          </button>
        )}
      </div>
    </div>
  );
}

const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-5">{title}</h3>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid md:grid-cols-2 gap-5">{children}</div>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
