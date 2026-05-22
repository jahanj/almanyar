'use client';

import { useMemo, useState } from 'react';
import type { Dictionary } from '@/lib/i18n';

const serviceOptions = [
  { value: 'STUDENT_RESIDENCE', label: 'اقامت تحصیلی آلمان' },
  { value: 'TURKEY_RESIDENCE', label: 'اقامت تحصیلی ترکیه' },
  { value: 'HOUSING', label: 'یافتن مسکن' },
  { value: 'UNIVERSITY_SELECTION', label: 'انتخاب دانشگاه' },
  { value: 'AUSBILDUNG', label: 'اوسبیلدونگ' },
  { value: 'OTHER', label: 'سایر' },
] as const;

const consultationTimes = [
  { value: 'MORNING', label: 'صبح' },
  { value: 'AFTERNOON', label: 'عصر' },
  { value: 'EVENING', label: 'شب' },
  { value: 'FLEXIBLE', label: 'فرقی ندارد' },
] as const;

type StepKey = 1 | 2 | 3;

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  serviceType: string;
  preferredTime: string;
  website: string;
  confirmed: boolean;
  // LEGAL-04 — consent record.
  termsAccepted: boolean;
  marketingConsent: boolean;
};

const initialFormState: FormState = {
  fullName: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  serviceType: '',
  preferredTime: 'FLEXIBLE',
  website: '',
  confirmed: false,
  termsAccepted: false,
  marketingConsent: false,
};

const cardButtonBase =
  'rounded-xl border px-4 py-3 text-right transition focus:outline-none focus:ring-2 focus:ring-brand-500/30';
const inputBase =
  'mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20';

function getServiceLabel(value: string) {
  return serviceOptions.find((option) => option.value === value)?.label ?? 'انتخاب نشده';
}

function getTimeLabel(value: string) {
  return consultationTimes.find((option) => option.value === value)?.label ?? 'فرقی ندارد';
}

function StepBadge({ step, active }: { step: StepKey; active: boolean }) {
  return (
    <div
      className={[
        'flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold',
        active ? 'bg-brand-600 text-white shadow-soft' : 'border border-slate-200 bg-white text-slate-500',
      ].join(' ')}
      aria-hidden="true"
    >
      {step}
    </div>
  );
}

export default function ContactForm({ dict }: { dict: Dictionary }) {
  const [step, setStep] = useState<StepKey>(1);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const selectedServiceLabel = useMemo(() => getServiceLabel(form.serviceType), [form.serviceType]);
  const selectedTimeLabel = useMemo(() => getTimeLabel(form.preferredTime), [form.preferredTime]);

  const canContinueStepOne = form.serviceType !== '';
  const canContinueStepTwo =
    form.fullName.trim().length >= 2 && /\S+@\S+\.\S+/.test(form.email.trim()) && form.message.trim().length >= 10;

  const goNext = () => {
    if (step === 1 && !canContinueStepOne) {
      setErr('یک گزینه را انتخاب کنید.');
      return;
    }

    if (step === 2 && !canContinueStepTwo) {
      setErr('نام، ایمیل و توضیح کوتاه را کامل کنید.');
      return;
    }

    setErr(null);
    setStep((current) => (current < 3 ? ((current + 1) as StepKey) : current));
  };

  const goBack = () => {
    setErr(null);
    setStep((current) => (current > 1 ? ((current - 1) as StepKey) : current));
  };

  const resetForm = () => {
    setStep(1);
    setForm(initialFormState);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    if (step < 3) {
      goNext();
      return;
    }

    if (!form.confirmed) {
      setErr('لطفاً اطلاعات را تایید کنید.');
      return;
    }

    // LEGAL-04 — required consent gate.
    if (!form.termsAccepted) {
      setErr('برای ارسال فرم، موافقت با حریم خصوصی و سلب مسئولیت لازم است.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        subject: form.subject.trim() || `درخواست مشاوره - ${selectedServiceLabel}`,
        message: [
          form.message.trim(),
          '',
          `خدمت مدنظر: ${selectedServiceLabel}`,
          `زمان مشاوره ترجیحی: ${selectedTimeLabel}`,
        ].join('\n'),
        serviceType: form.serviceType,
        website: form.website,
        consent: {
          termsAccepted: form.termsAccepted,
          marketingConsent: form.marketingConsent,
        },
      };

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? dict.contactForm.error);

      setMsg(data.message ?? dict.contactForm.success);
      resetForm();
    } catch (error) {
      setErr(error instanceof Error ? error.message : dict.contactForm.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="section-padding bg-slate-50">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <span className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
            {dict.contactForm.title}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            فقط ۳ مرحله تا شروع مشاوره
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
            به جای فرم شلوغ، مسیر را کوتاه کردیم تا سریع‌تر بفهمیم الان کجای مسیر هستید و چطور کمک کنیم.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card sm:p-6 md:p-8">
          <div className="mb-6 grid gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4 sm:grid-cols-3">
            {[
              { step: 1 as StepKey, title: 'الان کجای مسیر هستی؟' },
              { step: 2 as StepKey, title: 'اطلاعات تماس' },
              { step: 3 as StepKey, title: 'تایید + زمان مشاوره' },
            ].map((item) => {
              const active = step === item.step;
              return (
                <div
                  key={item.step}
                  className={[
                    'flex items-center gap-3 rounded-xl border px-4 py-3',
                    active ? 'border-brand-200 bg-white shadow-soft ring-1 ring-brand-100' : 'border-transparent bg-transparent',
                  ].join(' ')}
                >
                  <StepBadge step={item.step} active={active} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">مرحله {item.step}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{item.title}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {msg ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white shadow-soft">
                ✓
              </div>
              <p className="text-sm font-semibold text-emerald-800">{msg}</p>
              <p className="mt-2 text-sm leading-7 text-emerald-700">
                کارشناسان ما به‌زودی برای هماهنگی با شما تماس می‌گیرند.
              </p>
              <button
                type="button"
                onClick={() => setMsg(null)}
                className="mt-4 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-soft transition hover:bg-slate-50"
              >
                ارسال درخواست جدید
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-6">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">الان کجای مسیر هستی؟</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      یکی از گزینه‌ها را انتخاب کن تا مسیر پیشنهاد مناسب‌تری بسازیم.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {serviceOptions.map((option) => {
                      const active = form.serviceType === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setForm((current) => ({ ...current, serviceType: option.value }));
                            setErr(null);
                          }}
                          className={[
                            cardButtonBase,
                            'min-h-[64px] font-bold',
                            active
                              ? 'border-brand-500 bg-brand-50 text-brand-900 ring-2 ring-brand-200'
                              : 'border-slate-200 bg-white text-slate-800 hover:border-brand-300 hover:bg-slate-50',
                          ].join(' ')}
                          aria-pressed={active}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">اطلاعات تماس</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      اطلاعات را کوتاه و دقیق وارد کن تا بتوانیم سریع‌تر پاسخ بدهیم.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-bold text-slate-700" htmlFor="contact-full-name">
                        {dict.contactForm.name}
                      </label>
                      <input
                        id="contact-full-name"
                        value={form.fullName}
                        onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                        required
                        minLength={2}
                        maxLength={120}
                        className={inputBase}
                        placeholder="نام و نام خانوادگی"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700" htmlFor="contact-email">
                        {dict.contactForm.email}
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        value={form.email}
                        onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                        required
                        className={inputBase}
                        placeholder="name@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700" htmlFor="contact-phone">
                        {dict.contactForm.phone}
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        value={form.phone}
                        onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                        className={inputBase}
                        placeholder="09..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700" htmlFor="contact-subject">
                        {dict.contactForm.subject}
                      </label>
                      <input
                        id="contact-subject"
                        value={form.subject}
                        onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                        maxLength={200}
                        className={inputBase}
                        placeholder="اختیاری"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700" htmlFor="contact-message">
                      {dict.contactForm.message}
                    </label>
                    <textarea
                      id="contact-message"
                      value={form.message}
                      onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                      required
                      minLength={10}
                      maxLength={5000}
                      rows={5}
                      className={inputBase}
                      placeholder="کمی درباره وضعیت فعلی‌ات بنویس..."
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">تایید + زمان مشاوره</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      قبل از ارسال، اطلاعات زیر را مرور کن و زمان مناسب تماس را انتخاب کن.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-soft">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">خدمت انتخابی</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">{selectedServiceLabel}</p>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">اطلاعات تماس</p>
                      <p className="mt-2 text-sm font-bold text-slate-800">{form.fullName || '—'}</p>
                      <p className="mt-1 text-sm text-slate-700">{form.email || '—'}</p>
                      <p className="mt-1 text-sm text-slate-700">{form.phone || '—'}</p>
                    </div>

                    <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-4 shadow-soft">
                      <label className="block text-sm font-semibold text-slate-800" htmlFor="contact-time">
                        زمان مشاوره ترجیحی
                      </label>
                      <select
                        id="contact-time"
                        value={form.preferredTime}
                        onChange={(event) => setForm((current) => ({ ...current, preferredTime: event.target.value }))}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                      >
                        {consultationTimes.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      <label className="mt-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-800">
                        <input
                          type="checkbox"
                          checked={form.confirmed}
                          onChange={(event) => setForm((current) => ({ ...current, confirmed: event.target.checked }))}
                          className="mt-1 h-5 w-5 rounded border-slate-400 text-slate-950 focus:ring-slate-950"
                        />
                        <span>اطلاعات بالا را تایید می‌کنم و آماده‌ی تماس مشاوره هستم.</span>
                      </label>

                      {/* LEGAL-04 — required terms + optional marketing. */}
                      <label
                        className="mt-3 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-800"
                        data-testid="contact-consent-terms-wrap"
                      >
                        <input
                          type="checkbox"
                          checked={form.termsAccepted}
                          onChange={(event) => setForm((current) => ({ ...current, termsAccepted: event.target.checked }))}
                          className="mt-1 h-5 w-5 rounded border-slate-400 text-slate-950 focus:ring-slate-950"
                          data-testid="contact-consent-terms"
                        />
                        <span>
                          با{' '}
                          <a href="/fa/privacy" target="_blank" rel="noopener" className="text-brand-700 underline-offset-2 hover:underline">حریم خصوصی</a>{' '}
                          و{' '}
                          <a href="/fa/disclaimer" target="_blank" rel="noopener" className="text-brand-700 underline-offset-2 hover:underline">سلب مسئولیت</a>{' '}
                          موافقم <span className="text-red-500">*</span>
                        </span>
                      </label>
                      <label
                        className="mt-3 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-800"
                        data-testid="contact-marketing-wrap"
                      >
                        <input
                          type="checkbox"
                          checked={form.marketingConsent}
                          onChange={(event) => setForm((current) => ({ ...current, marketingConsent: event.target.checked }))}
                          className="mt-1 h-5 w-5 rounded border-slate-400 text-slate-950 focus:ring-slate-950"
                          data-testid="contact-marketing"
                        />
                        <span>موافقم راهنماها و اطلاعات مفید را از طریق ایمیل دریافت کنم (اختیاری)</span>
                      </label>
                    </div>
                  </div>

                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">خلاصه نهایی</p>
                    <p className="mt-2 text-sm leading-7 text-slate-700">
                      خدمت: <span className="font-bold text-slate-950">{selectedServiceLabel}</span> · زمان پیشنهادی:{' '}
                      <span className="font-bold text-slate-950">{selectedTimeLabel}</span>
                    </p>
                  </div>
                </div>
              )}

              {err && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800" aria-live="polite">
                  {err}
                </p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={goBack}
                      className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-soft transition hover:bg-slate-50"
                    >
                      مرحله قبل
                    </button>
                  )}
                </div>

                <button
                  type={step === 3 ? 'submit' : 'button'}
                  onClick={step < 3 ? goNext : undefined}
                  disabled={loading}
                  className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'در حال ارسال...' : step === 1 ? 'ادامه' : step === 2 ? 'بررسی نهایی' : 'تایید و ارسال'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
