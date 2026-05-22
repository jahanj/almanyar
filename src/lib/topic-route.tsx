import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { localePath, type Locale } from '@/lib/i18n';
import PageHero, { pageCtaPrimary, pageCtaSecondary } from '@/components/PageHero';
import JsonLd from '@/components/JsonLd';
import FaqAccordion from '@/components/FaqAccordion';
import { pageMetadata, breadcrumbLd, faqLd, articleLd, localizedUrl } from '@/lib/seo';
import { resolveUpdatedAt } from '@/lib/dates';
import { TOPICS, TOPIC_BY_PATH, GROUP_STYLE, SEGMENT_LABEL, type Topic } from '@/lib/germany-topics';
import { TOPIC_CONTENT } from '@/lib/topic-content';
import type { TopicContent } from '@/lib/topic-content/types';

type Params = { locale: Locale; slug?: string[] };

const pathFor = (segment: string, slug?: string[]) =>
  '/' + segment + (slug && slug.length ? '/' + slug.join('/') : '');

/** Render `\n\n`-separated paragraphs from a content body string. */
function Paragraphs({ body, className }: { body: string; className?: string }) {
  return (
    <>
      {body.split('\n\n').map((p, i) => (
        <p key={i} className={className}>
          {p}
        </p>
      ))}
    </>
  );
}

export function topicRoute(segment: string) {
  function generateStaticParams() {
    const topicSlugs = TOPICS.filter((t) => t.href.split('/')[1] === segment).map((t) => ({
      slug: t.href.split('/').slice(2),
    }));
    // Also pre-render the bare segment (group index) if no topic claims it —
    // this is what the visible breadcrumb middle link points to.
    const hasBareTopic = !!TOPIC_BY_PATH['/' + segment];
    return hasBareTopic ? topicSlugs : [...topicSlugs, { slug: [] }];
  }

  function generateMetadata({ params }: { params: Params }): Metadata {
    const topic = TOPIC_BY_PATH[pathFor(segment, params.slug)];
    if (!topic) {
      // Group-index page (no specific topic). Build a generic metadata block.
      if (!params.slug || params.slug.length === 0) {
        const label = SEGMENT_LABEL[segment] ?? segment;
        return pageMetadata({
          locale: params.locale,
          path: '/' + segment,
          title: `${label} | آلمانیار`,
          description: `راهنماها و مقاله‌های مرتبط با «${label}» در آلمانیار.`,
          type: 'website',
        });
      }
      return {};
    }
    const content = TOPIC_CONTENT[topic.href];
    const description = content?.intro ?? topic.desc;
    return pageMetadata({
      locale: params.locale,
      path: topic.href,
      title: `${topic.title} | آلمانیار`,
      description,
      type: 'article',
    });
  }

  async function Page({ params }: { params: Params }) {
    const path = pathFor(segment, params.slug);
    const topic = TOPIC_BY_PATH[path];
    if (!topic) {
      // No specific topic for this bare segment (most groups) — render a group
      // index that lists every topic in this group. This is what the breadcrumb
      // middle link points to, so it must always exist.
      if (!params.slug || params.slug.length === 0) {
        return groupIndexPage(segment, params.locale);
      }
      notFound();
    }

    const locale = params.locale;
    const style = GROUP_STYLE[topic.group];
    const segLabel = SEGMENT_LABEL[segment] ?? style.label;
    const content: TopicContent | undefined = TOPIC_CONTENT[topic.href];

    const related = TOPICS.filter((t) => t.group === topic.group && t.href !== topic.href).slice(0, 6);
    // Cross-group internal links: one representative topic from each *other* group.
    const suggested: Topic[] = (['visa', 'study', 'work', 'jobs', 'life', 'exams'] as const)
      .filter((g) => g !== topic.group)
      .map((g) => TOPICS.find((t) => t.group === g))
      .filter((t): t is Topic => Boolean(t));

    const updatedAt = resolveUpdatedAt({
      explicit: content?.updatedAt,
      sourceFile: 'src/lib/topic-route.tsx',
    });

    const jsonLd: object[] = [
      breadcrumbLd([
        { name: 'خانه', url: localizedUrl(locale) },
        { name: segLabel, url: localizedUrl(locale, '/' + segment) },
        { name: topic.title, url: localizedUrl(locale, topic.href) },
      ]),
      articleLd({
        locale,
        path: topic.href,
        headline: topic.title,
        description: content?.intro ?? topic.desc,
        dateModified: updatedAt,
      }),
    ];
    if (content?.faqs?.length) jsonLd.push(faqLd(content.faqs));

    return (
      <div className="min-h-screen bg-slate-50">
        <JsonLd data={jsonLd} />

        <PageHero
          locale={locale}
          icon={topic.icon}
          eyebrow={segLabel}
          title={topic.title}
          subtitle={content?.intro ?? topic.desc}
          accentGradient={style.gradient}
          updatedAt={updatedAt}
          breadcrumbs={[
            { label: 'خانه', href: localePath(locale) },
            { label: segLabel, href: localePath(locale, '/' + segment) },
            { label: topic.title },
          ]}
        >
          {pageCtaPrimary(localePath(locale, '/evaluation'), 'فرم ارزیابی رایگان')}
          {pageCtaSecondary(localePath(locale, '#contact'), 'مشاوره و تماس')}
        </PageHero>

        <main className="container mx-auto max-w-4xl space-y-12 px-4 py-12 sm:px-6">
          {content ? (
            <>
              {/* At-a-glance highlights */}
              {content.highlights && content.highlights.length > 0 && (
                <section aria-label="نگاه کلی" className="grid gap-4 sm:grid-cols-2">
                  {content.highlights.map((h, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 rounded-2xl border ${style.border} bg-white p-4 shadow-soft`}
                    >
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${style.soft} text-2xl`}
                      >
                        {h.icon}
                      </span>
                      <span>
                        <span className="block font-semibold text-slate-900">{h.title}</span>
                        <span className="mt-0.5 block text-sm leading-6 text-slate-500">{h.desc}</span>
                      </span>
                    </div>
                  ))}
                </section>
              )}

              {/* Prose sections */}
              {content.sections.map((s, i) => (
                <section key={i} aria-labelledby={`sec-${i}`}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className={`inline-block h-6 w-1.5 rounded-full bg-gradient-to-b ${style.gradient}`} aria-hidden="true" />
                    <h2 id={`sec-${i}`} className={`text-xl font-bold md:text-2xl ${style.accentText}`}>
                      {s.heading}
                    </h2>
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft md:p-8">
                    <div className="space-y-4 leading-8 text-slate-700">
                      <Paragraphs body={s.body} />
                    </div>
                    {s.bullets && s.bullets.length > 0 && (
                      <ul className="mt-5 space-y-2.5">
                        {s.bullets.map((b, j) => (
                          <li key={j} className="flex items-start gap-3 text-slate-700">
                            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${style.accentBg}`} aria-hidden="true" />
                            <span className="leading-7">{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
              ))}

              {/* Step-by-step */}
              {content.steps && content.steps.length > 0 && (
                <section aria-labelledby="steps-title">
                  <div className="mb-4 flex items-center gap-3">
                    <span className={`inline-block h-6 w-1.5 rounded-full bg-gradient-to-b ${style.gradient}`} aria-hidden="true" />
                    <h2 id="steps-title" className={`text-xl font-bold md:text-2xl ${style.accentText}`}>
                      مراحل گام‌به‌گام
                    </h2>
                  </div>
                  <ol className="space-y-4">
                    {content.steps.map((step, i) => (
                      <li
                        key={i}
                        className={`flex items-start gap-4 rounded-2xl border ${style.border} bg-white p-5 shadow-soft`}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.accentBg} text-sm font-bold text-white`}
                        >
                          {i + 1}
                        </span>
                        <span>
                          <span className="block font-semibold text-slate-900">{step.title}</span>
                          <span className="mt-1 block text-sm leading-7 text-slate-600">{step.desc}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {/* FAQ */}
              {content.faqs && content.faqs.length > 0 && (
                <section aria-labelledby="faq-title">
                  <div className="mb-4 flex items-center gap-3">
                    <span className={`inline-block h-6 w-1.5 rounded-full bg-gradient-to-b ${style.gradient}`} aria-hidden="true" />
                    <h2 id="faq-title" className={`text-xl font-bold md:text-2xl ${style.accentText}`}>
                      سوالات متداول
                    </h2>
                  </div>
                  <FaqAccordion items={content.faqs} />
                </section>
              )}
            </>
          ) : (
            // Graceful fallback for any topic without authored content yet.
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft md:p-8">
              <p className="leading-8 text-slate-700">
                راهنمای کامل «{topic.title}» به‌زودی در این صفحه منتشر می‌شود. برای دریافت مشاوره رایگان درباره
                این موضوع، همین حالا با کارشناسان آلمانیار در تماس باشید.
              </p>
            </div>
          )}

          {/* Conversion CTA */}
          <section
            aria-label="درخواست مشاوره"
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${style.gradient} p-8 text-white shadow-glow md:p-10`}
          >
            <div className="absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10" aria-hidden="true" />
            <div className="relative">
              <h2 className="text-2xl font-bold md:text-3xl">
                {content?.cta?.title ?? 'مسیر مهاجرت خود را با اطمینان شروع کنید'}
              </h2>
              <p className="mt-3 max-w-2xl leading-8 text-white/90">
                {content?.cta?.desc ??
                  'کارشناسان آلمانیار شرایط شما را به‌صورت رایگان بررسی می‌کنند و بهترین مسیر را پیشنهاد می‌دهند. همین امروز اولین قدم را بردارید.'}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={localePath(locale, '/evaluation')}
                  className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-soft transition hover:bg-slate-100"
                >
                  بررسی رایگان شرایط
                </Link>
                <Link
                  href={localePath(locale, '#contact')}
                  className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  درخواست تماس
                </Link>
              </div>
            </div>
          </section>

          {/* Related topics (same group) */}
          {related.length > 0 && (
            <section aria-labelledby="related-title">
              <h2 id="related-title" className="mb-4 text-xl font-bold text-slate-900">
                مطالب مرتبط
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r.href}
                    href={localePath(locale, r.href)}
                    aria-label={r.title}
                    className={`card-hover flex items-start gap-3 rounded-2xl border ${style.border} bg-white p-4 shadow-soft transition`}
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

          {/* Cross-group suggestions for internal linking */}
          {suggested.length > 0 && (
            <section aria-labelledby="suggested-title">
              <h2 id="suggested-title" className="mb-4 text-xl font-bold text-slate-900">
                راهنماهای پیشنهادی
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {suggested.map((r) => {
                  const rStyle = GROUP_STYLE[r.group];
                  return (
                    <Link
                      key={r.href}
                      href={localePath(locale, r.href)}
                      aria-label={r.title}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 p-5 text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
                    >
                      <span className={`absolute inset-0 bg-gradient-to-br ${rStyle.gradient}`} aria-hidden="true" />
                      <span className="relative mb-2 block text-2xl">{r.icon}</span>
                      <span className="relative block text-sm font-semibold leading-7">{r.title}</span>
                      <span className="relative mt-0.5 block text-xs leading-6 text-white/85">{r.desc}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </main>

      </div>
    );
  }

  return { generateStaticParams, generateMetadata, Page };
}

/** Per-segment hub intro copy. Visa specifically gets a tailored intro that
 *  steers visitors to the long-form "what is" article. */
const HUB_INTRO: Record<string, string> = {
  'germany-visa':
    'ویزای آلمان انواع متفاوتی دارد — تحصیلی، کاری، آوسبیلدونگ، شنگن، پیوست خانواده و کارت شانس. ' +
    'برای آشنایی کلی با ماهیت ویزای آلمان مقالهٔ «ویزای آلمان چیست؟» را ببینید، یا یکی از موضوعات تخصصی زیر را انتخاب کنید.',
};

/** Group-index landing page used when /fa/<segment> has no specific topic. */
function groupIndexPage(segment: string, locale: Locale) {
  const segLabel = SEGMENT_LABEL[segment] ?? segment;
  const topicsInGroup = TOPICS.filter((t) => t.href.split('/')[1] === segment);
  const style = topicsInGroup[0] ? GROUP_STYLE[topicsInGroup[0].group] : GROUP_STYLE.visa;
  const subtitle = HUB_INTRO[segment] ?? 'موضوعات این بخش را در ادامه ببینید.';

  const jsonLd = breadcrumbLd([
    { name: 'خانه', url: localizedUrl(locale) },
    { name: segLabel, url: localizedUrl(locale, '/' + segment) },
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <JsonLd data={[jsonLd]} />

      <PageHero
        locale={locale}
        eyebrow={segLabel}
        title={segLabel}
        subtitle={subtitle}
        accentGradient={style.gradient}
        breadcrumbs={[
          { label: 'خانه', href: localePath(locale) },
          { label: segLabel },
        ]}
      >
        {pageCtaPrimary(localePath(locale, '/evaluation'), 'فرم ارزیابی رایگان')}
        {pageCtaSecondary(localePath(locale, '#contact'), 'مشاوره و تماس')}
      </PageHero>

      <main className="container mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topicsInGroup.map((t) => (
            <Link
              key={t.href}
              href={localePath(locale, t.href)}
              aria-label={t.title}
              className={`card-hover flex items-start gap-3 rounded-2xl border ${style.border} bg-white p-4 shadow-soft transition`}
            >
              <span className="text-2xl">{t.icon}</span>
              <span>
                <span className="block text-sm font-semibold text-slate-900">{t.title}</span>
                <span className="mt-0.5 block text-xs leading-6 text-slate-500">{t.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </main>

    </div>
  );
}
