import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDictionary, localePath } from '@/lib/i18n';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero, { pageCtaPrimary, pageCtaSecondary } from '@/components/PageHero';
import JsonLd from '@/components/JsonLd';
import { rootPageMetadata, breadcrumbLd, localizedUrl, absoluteUrl } from '@/lib/seo';
import { TOPICS, TOPIC_BY_PATH, GROUP_STYLE, SEGMENT_LABEL } from '@/lib/germany-topics';

type Params = { slug?: string[] };

const pathFor = (segment: string, slug?: string[]) =>
  '/' + segment + (slug && slug.length ? '/' + slug.join('/') : '');

export function topicRoute(segment: string) {
  function generateStaticParams() {
    return TOPICS.filter((t) => t.href.split('/')[1] === segment).map((t) => ({
      slug: t.href.split('/').slice(2),
    }));
  }

  function generateMetadata({ params }: { params: Params }): Metadata {
    const topic = TOPIC_BY_PATH[pathFor(segment, params.slug)];
    if (!topic) return {};
    return rootPageMetadata({
      path: topic.href,
      title: `${topic.title} | آلمانیار`,
      description: topic.desc,
    });
  }

  async function Page({ params }: { params: Params }) {
    const path = pathFor(segment, params.slug);
    const topic = TOPIC_BY_PATH[path];
    if (!topic) notFound();

    const locale = 'fa' as const;
    const dict = await getDictionary(locale);
    const style = GROUP_STYLE[topic.group];
    const segLabel = SEGMENT_LABEL[segment] ?? style.label;
    const related = TOPICS.filter((t) => t.group === topic.group && t.href !== topic.href).slice(0, 6);

    return (
      <div className="min-h-screen bg-slate-50">
        <JsonLd
          data={breadcrumbLd([
            { name: 'خانه', url: localizedUrl(locale) },
            { name: segLabel, url: absoluteUrl('/' + segment) },
            { name: topic.title, url: absoluteUrl(topic.href) },
          ])}
        />
        <Header dict={dict} locale={locale} />

        <PageHero
          locale={locale}
          icon={topic.icon}
          title={topic.title}
          subtitle={topic.desc}
          accentGradient={style.gradient}
          breadcrumbs={[
            { label: 'خانه', href: localePath(locale) },
            { label: segLabel },
          ]}
        >
          {pageCtaPrimary(localePath(locale, '/evaluation'), 'فرم ارزیابی رایگان')}
          {pageCtaSecondary(localePath(locale, '#contact'), 'مشاوره و تماس')}
        </PageHero>

        <main className="container mx-auto max-w-4xl space-y-10 px-4 py-12 sm:px-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft md:p-8">
            <p className="leading-8 text-slate-700">
              در این صفحه به‌زودی راهنمای کامل «{topic.title}» را منتشر می‌کنیم؛ شامل شرایط، مدارک،
              مراحل و نکات کاربردی برای ایرانیان در مسیر مهاجرت به آلمان از ترکیه.
            </p>
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
              <span className="text-2xl">🛠️</span>
              <p className="text-sm leading-7">
                این مطلب <b>در حال تکمیل</b> است. برای دریافت پاسخ سریع و مشاوره رایگان درباره این موضوع،
                همین حالا با کارشناسان آلمانیار در تماس باشید.
              </p>
            </div>
          </div>

          {related.length > 0 && (
            <section aria-labelledby="related-title">
              <h2 id="related-title" className="mb-4 text-xl font-bold text-slate-900">
                موضوعات مرتبط
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r.href}
                    href={r.href}
                    aria-label={r.title}
                    className="card-hover flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft transition"
                  >
                    <span className="text-2xl">{r.icon}</span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">{r.title}</span>
                      <span className="mt-0.5 block text-xs leading-6 text-slate-500">{r.desc}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>

        <Footer dict={dict} locale={locale} />
      </div>
    );
  }

  return { generateStaticParams, generateMetadata, Page };
}
