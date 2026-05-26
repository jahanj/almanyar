import Link from 'next/link';
import { WHATSAPP_URL } from '@/config/contact';
import WhatsAppIcon from '@/components/contact/WhatsAppIcon';

/**
 * Phase-9 §7 — Final CTA banner.
 *
 * Full-width dark gradient. Single primary action (start evaluation),
 * secondary WhatsApp link. No inline form here — form lives at
 * /fa/contact per Phase-9 locked decisions.
 */

export default function FinalCTA() {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-800 to-slate-950 py-24 text-white md:py-32"
      dir="rtl"
      aria-labelledby="final-cta-title"
    >
      {/* Soft accent glow */}
      <div
        className="absolute inset-x-0 top-0 h-72 opacity-40"
        style={{ background: 'radial-gradient(ellipse at center top, rgba(217,119,6,0.25), transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="container relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2
          id="final-cta-title"
          className="text-balance text-3xl font-bold leading-tight md:text-5xl"
        >
          آماده‌اید مسیرتان را شروع کنید؟
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-emerald-100/90 md:text-lg">
          یک فرم کوتاه ارزیابی، یک پاسخ شخصی از طرف مشاور. رایگان، در ۲۴ ساعت.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/fa/evaluation"
            className="inline-flex h-12 min-w-[260px] items-center justify-center rounded-xl bg-white px-7 text-base font-semibold text-emerald-800 shadow-card transition hover:bg-emerald-50"
          >
            شروع ارزیابی رایگان
          </Link>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-100 transition hover:text-white"
          >
            <WhatsAppIcon className="h-4 w-4" />
            یا تماس مستقیم در WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
