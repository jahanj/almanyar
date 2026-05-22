import type { Dictionary } from '@/lib/i18n';

const trustItems = [
  { label: 'Goethe · telc · TestDaF', icon: '📝' },
  { label: 'ویزا و وقت سفارت', icon: '🛂' },
  { label: 'پذیرش دانشگاه', icon: '🎓' },
  { label: 'اقامت ترکیه و آلمان', icon: '🏠' },
];

export default function TrustBar({ dict }: { dict: Dictionary }) {
  return (
    <section className="border-y border-slate-200/80 bg-white py-8">
      <div className="container mx-auto px-4 sm:px-6">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
          {dict.services.subtitle}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {trustItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 text-sm font-medium text-slate-700"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-base">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
