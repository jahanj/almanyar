'use client';

import { useState } from 'react';
import type { Dictionary } from '@/lib/i18n';

const serviceOptions = [
  { value: 'STUDENT_RESIDENCE', label: 'اقامت تحصیلی آلمان' },
  { value: 'TURKEY_RESIDENCE', label: 'اقامت تحصیلی ترکیه' },
  { value: 'HOUSING', label: 'یافتن مسکن' },
  { value: 'UNIVERSITY_SELECTION', label: 'انتخاب دانشگاه' },
  { value: 'AUSBILDUNG', label: 'اوسبیلدونگ' },
  { value: 'OTHER', label: 'سایر' },
];

export default function ContactForm({ dict }: { dict: Dictionary }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setMsg(null);
    setErr(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fd.get('fullName'),
          email: fd.get('email'),
          phone: fd.get('phone') || null,
          subject: fd.get('subject') || null,
          message: fd.get('message'),
          serviceType: fd.get('serviceType') || null,
          website: fd.get('website') || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? dict.contactForm.error);
      setMsg(dict.contactForm.success);
      e.currentTarget.reset();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : dict.contactForm.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="section-padding bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">{dict.contactForm.title}</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <form onSubmit={submit} className="bg-white rounded-3xl shadow-2xl p-8 space-y-5">
          {/* honeypot: hidden from humans, bots tend to fill it */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{dict.contactForm.name}</label>
              <input name="fullName" required minLength={2} maxLength={120} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{dict.contactForm.email}</label>
              <input name="email" type="email" required className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{dict.contactForm.phone}</label>
              <input name="phone" type="tel" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{dict.contactForm.serviceType}</label>
              <select name="serviceType" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="">---</option>
                {serviceOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{dict.contactForm.subject}</label>
            <input name="subject" maxLength={200} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{dict.contactForm.message}</label>
            <textarea name="message" required minLength={10} maxLength={5000} rows={5} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          {msg && <p className="text-green-700 bg-green-50 p-3 rounded-lg">{msg}</p>}
          {err && <p className="text-red-700 bg-red-50 p-3 rounded-lg">{err}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
          >
            {loading ? '...' : dict.contactForm.submit}
          </button>
        </form>
      </div>
    </section>
  );
}
