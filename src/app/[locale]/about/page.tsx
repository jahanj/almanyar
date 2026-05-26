import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { locales, localePath, type Locale } from '@/lib/i18n';
import PageHero, { pageCtaPrimary, pageCtaSecondary } from '@/components/PageHero';
import JsonLd from '@/components/JsonLd';
import { pageMetadata, breadcrumbLd, articleLd, localizedUrl } from '@/lib/seo';
import { resolveUpdatedAt } from '@/lib/dates';
import { ABOUT } from '@/lib/owner-content';
import { OWNER, OWNER_PHOTO_URL, OWNER_PHOTO_WIDTH, OWNER_PHOTO_HEIGHT } from '@/lib/owner';
import { WHATSAPP_URL } from '@/config/contact';
import PanelLanding from '@/components/PanelLanding';

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  return pageMetadata({
    locale: params.locale,
    path: '/about',
    title: 'درباره محمد جهانبانی — بنیان‌گذار آلمانیار',
    description:
      'محمد جهانبانی، شش سال تجربه زندگی و تحصیل در ترکیه. مسیر مهاجرت تحصیلی به آلمان از ترکیه، با راهنمایی شفاف و صادقانه.',
    type: 'article',
  });
}

export default function AboutPage({ params }: { params: { locale: Locale } }) {
  if (!locales.includes(params.locale)) notFound();
  const updatedAt = resolveUpdatedAt({ sourceFile: 'src/lib/owner-content.ts' });

  return (
    <div className="min-h-screen bg-slate-50">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: 'خانه', url: localizedUrl(params.locale) },
            { name: 'درباره ما', url: localizedUrl(params.locale, '/about') },
          ]),
          articleLd({
            locale: params.locale,
            path: '/about',
            headline: 'درباره محمد جهانبانی — بنیان‌گذار آلمانیار',
            description:
              'مسیر شخصی محمد جهانبانی در ترکیه و آلمان، و چرایی شکل‌گیری آلمانیار.',
            dateModified: updatedAt,
          }),
        ]}
      />

      <PageHero
        locale={params.locale}
        eyebrow="درباره ما"
        title={ABOUT.pageTitle}
        subtitle="مشاور شخصی، نه شرکت ثبت‌شده. ۶ سال تجربه واقعی در ترکیه."
        updatedAt={updatedAt}
        accentGradient="from-emerald-700 to-emerald-900"
        breadcrumbs={[
          { label: 'خانه', href: localePath(params.locale) },
          { label: 'درباره ما' },
        ]}
      />

      <main className="container mx-auto max-w-4xl space-y-12 px-4 py-12 sm:px-6">
        {/* Intro — photo + greeting + bio paragraphs side-by-side. */}
        <section
          aria-labelledby="about-greeting"
          className="rounded-3xl border border-emerald-200/70 bg-white p-6 shadow-soft md:p-10"
        >
          <div className="grid items-center gap-8 md:grid-cols-[280px_1fr]">
            <div className="mx-auto md:mx-0">
              <Image
                src={OWNER_PHOTO_URL}
                width={OWNER_PHOTO_WIDTH}
                height={OWNER_PHOTO_HEIGHT}
                alt="محمد جهانبانی، بنیان‌گذار آلمانیار"
                priority
                className="h-56 w-56 rounded-3xl object-cover shadow-card md:h-64 md:w-64"
              />
            </div>
            <div>
              <h2 id="about-greeting" className="text-2xl font-bold text-emerald-900 md:text-3xl">
                {ABOUT.greeting}
              </h2>
              <div className="mt-4 space-y-4 leading-8 text-slate-700">
                {ABOUT.intro.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why this route */}
        <section
          aria-labelledby="about-why"
          className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft md:p-8"
        >
          <h2 id="about-why" className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">
            {ABOUT.why.title}
          </h2>
          <div className="space-y-4 leading-8 text-slate-700">
            {ABOUT.why.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <ul className="space-y-2 ps-4">
              {ABOUT.why.bullets.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" aria-hidden="true" />
                  <span className="leading-7">{b}</span>
                </li>
              ))}
            </ul>
            <p className="font-semibold text-emerald-800">{ABOUT.why.closing}</p>
          </div>
        </section>

        {/* What I can do */}
        <section
          aria-labelledby="about-services"
          className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft md:p-8"
        >
          <h2 id="about-services" className="mb-6 text-xl font-bold text-slate-900 md:text-2xl">
            {ABOUT.services.title}
          </h2>

          <div className="space-y-8">
            <div>
              <h3 className="mb-3 font-semibold text-emerald-900">
                {ABOUT.services.turkey.heading}
              </h3>
              <ul className="space-y-2 ps-4">
                {ABOUT.services.turkey.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-slate-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" aria-hidden="true" />
                    <span className="leading-7">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-3 font-semibold text-amber-800">
                {ABOUT.services.germany.heading}
              </h3>
              <div className="space-y-3 leading-8 text-slate-700">
                {ABOUT.services.germany.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Working principles */}
        <section
          aria-labelledby="about-principles"
          className="rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-soft md:p-8"
        >
          <h2 id="about-principles" className="mb-4 text-xl font-bold text-emerald-900 md:text-2xl">
            {ABOUT.principles.title}
          </h2>
          <ul className="space-y-3">
            {ABOUT.principles.bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-slate-700">
                <span aria-hidden="true" className="mt-1 text-emerald-700">✓</span>
                <span className="leading-7">{b}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section
          aria-label="تماس"
          className="rounded-3xl bg-gradient-to-br from-emerald-700 to-emerald-900 p-8 text-white shadow-glow md:p-10"
        >
          <h2 className="text-2xl font-bold md:text-3xl">آمادهٔ شروع گفت‌وگو؟</h2>
          <p className="mt-3 max-w-2xl leading-8 text-white/90">
            ساده‌ترین راه، یک پیام واتساپ است. می‌توانم پاسخ سؤالات اولیه را همان‌جا بدهم — یا اگر ترجیح می‌دهید، فرم تماس را پر کنید.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:brightness-95"
            >
              <span aria-hidden="true">💬</span>
              شروع گفت‌وگو در واتساپ
            </a>
            <Link
              href={localePath(params.locale, '/contact')}
              className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              ارسال پیام از طریق فرم تماس
            </Link>
          </div>
        </section>

        {/* Phase-9 §3 — PanelLanding relocated from homepage. The dashboard
            walkthrough lives here under About so visitors who want to know
            "how does the panel work?" can read it without it dominating
            the homepage. */}
        <PanelLanding />
      </main>
    </div>
  );
}
