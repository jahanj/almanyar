import Link from 'next/link';
import { TOPICS, GROUP_STYLE, type TopicGroup } from '@/lib/germany-topics';
import SectionHeader from './SectionHeader';

const GROUP_ORDER: TopicGroup[] = ['visa', 'study', 'work', 'jobs', 'life', 'exams'];

export default function GermanyTopics() {
  return (
    <section aria-labelledby="germany-topics-title" className="border-t border-slate-200/80 bg-slate-50 py-14 md:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div id="germany-topics-title">
          <SectionHeader
            title="دانستنی‌های کاربردی آلمان"
            subtitle="راهنماهای مهم برای ویزا، تحصیل، کار و زندگی در آلمان"
          />
        </div>

        <div className="space-y-12">
          {GROUP_ORDER.map((group) => {
            const items = TOPICS.filter((t) => t.group === group);
            if (items.length === 0) return null;
            const style = GROUP_STYLE[group];
            return (
              <div key={group}>
                <div className="mb-5 flex items-center gap-3">
                  <span
                    className={`inline-block h-6 w-1 rounded-full bg-gradient-to-b ${style.gradient}`}
                    aria-hidden="true"
                  />
                  <h3 className="text-base font-semibold text-slate-800">{style.label}</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {items.map((t) => (
                    <Link
                      key={t.href}
                      href={t.href}
                      aria-label={t.title}
                      className={`group relative overflow-hidden rounded-2xl border border-white/10 p-5 text-white shadow-soft bg-gradient-to-br ${style.gradient} transition hover:-translate-y-0.5 hover:shadow-card`}
                    >
                      <span
                        aria-hidden="true"
                        className="absolute -start-6 -top-6 h-20 w-20 rounded-full bg-white/10 transition-transform duration-300 group-hover:scale-150"
                      />
                      <span className="relative mb-3 block text-2xl">{t.icon}</span>
                      <h3 className="relative mb-1 text-base font-semibold leading-7">{t.title}</h3>
                      <p className="relative text-sm leading-6 text-white/85">{t.desc}</p>
                      <span className="relative mt-3 inline-flex items-center gap-1 text-sm font-medium text-white/90 group-hover:text-white">
                        مشاهده
                        <svg className="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
