import type { Dictionary } from '@/lib/i18n';
import SectionHeader from './SectionHeader';

export default function Process({ dict }: { dict: Dictionary }) {
  return (
    <section id="process" className="section-padding bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow={dict.nav.process}
          title={dict.process.title}
          subtitle={dict.process.subtitle}
        />

        <div className="mx-auto max-w-4xl">
          <div className="relative space-y-0">
            {dict.process.steps.map((step, idx) => {
              const isLast = idx === dict.process.steps.length - 1;
              return (
                <div key={step.title} className="relative flex gap-4 md:gap-6">
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white shadow-soft md:h-12 md:w-12 md:text-base">
                      {idx + 1}
                    </div>
                    {!isLast && (
                      <div className="my-1 w-px flex-1 bg-gradient-to-b from-brand-300 to-slate-200 min-h-[2rem]" aria-hidden="true" />
                    )}
                  </div>
                  <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-8 md:pb-10'}`}>
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft md:p-6">
                      <h3 className="text-lg font-semibold text-slate-900 md:text-xl">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 md:text-base">{step.text}</p>
                      <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-800">
                        <span aria-hidden="true">⏱</span>
                        <span>{step.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
