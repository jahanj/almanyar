import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary, locales, type Locale } from '@/lib/i18n';
import PageHero from '@/components/PageHero';
import ContactForm from '@/components/ContactForm';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd, localizedUrl, pageMetadata, SITE } from '@/lib/seo';
import { CONTACT_EMAIL, CONTACT_EMAIL_MAILTO, WHATSAPP_PHONE, WHATSAPP_URL } from '@/config/contact';
import WhatsAppIcon from '@/components/contact/WhatsAppIcon';

/**
 * Phase-9 — dedicated /fa/contact page. The contact form previously
 * lived inline at the bottom of the homepage; relocating it here keeps
 * the homepage focused on the journey arc.
 *
 * Existing #contact anchors throughout the site continue to resolve
 * (browsers ignore the unknown fragment).
 */

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  return pageMetadata({
    locale: params.locale,
    path: '/contact',
    title: 'تماس با آلمانیار',
    description: 'با آلمانیار در ارتباط باشید — فرم تماس، WhatsApp، یا ایمیل مستقیم به مشاور.',
    type: 'website',
  });
}

export default async function ContactPage({ params }: { params: { locale: Locale } }) {
  if (!locales.includes(params.locale)) notFound();
  const dict = await getDictionary(params.locale);

  return (
    <div className="min-h-screen bg-slate-50">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: 'خانه', url: localizedUrl(params.locale) },
            { name: 'تماس', url: localizedUrl(params.locale, '/contact') },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            url: `${SITE.url}/${params.locale}/contact`,
            mainEntity: { '@id': `${SITE.url}/#person` },
          },
        ]}
      />

      <PageHero
        locale={params.locale}
        eyebrow="در ارتباط باشید"
        title="تماس با آلمانیار"
        subtitle="یک پیام، یک پاسخ شخصی — معمولاً در ۲۴ ساعت."
        breadcrumbs={[
          { label: 'خانه', href: '/fa' },
          { label: 'تماس' },
        ]}
      />

      <main className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16">
        {/* Quick-contact options ABOVE the form so users in a hurry don't
            need to scroll. */}
        <section
          aria-label="راه‌های سریع ارتباط"
          className="mb-12 grid gap-4 sm:grid-cols-2"
          dir="rtl"
        >
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl border border-emerald-200/80 bg-white p-5 shadow-soft transition hover:border-[#25D366] hover:shadow-card"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white">
              <WhatsAppIcon className="h-6 w-6" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-bold text-slate-900">WhatsApp</span>
              <span className="block text-xs text-slate-500" dir="ltr">{WHATSAPP_PHONE}</span>
            </span>
          </a>
          <a
            href={CONTACT_EMAIL_MAILTO}
            className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft transition hover:border-emerald-300 hover:shadow-card"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
              ✉️
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-bold text-slate-900">ایمیل</span>
              <span className="block text-xs text-slate-500" dir="ltr">{CONTACT_EMAIL}</span>
            </span>
          </a>
        </section>

        {/* The full form for people who prefer async + want to share details */}
        <div id="contact">
          <ContactForm dict={dict} />
        </div>
      </main>
    </div>
  );
}
