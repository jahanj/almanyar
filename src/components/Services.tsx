import type { Dictionary } from '@/lib/i18n';

const borderColors = ['blue', 'green', 'purple', 'red', 'yellow', 'indigo'] as const;
const colorMap: Record<typeof borderColors[number], { border: string; bg: string }> = {
  blue:   { border: 'border-blue-500',   bg: 'bg-blue-100' },
  green:  { border: 'border-green-500',  bg: 'bg-green-100' },
  purple: { border: 'border-purple-500', bg: 'bg-purple-100' },
  red:    { border: 'border-red-500',    bg: 'bg-red-100' },
  yellow: { border: 'border-yellow-500', bg: 'bg-yellow-100' },
  indigo: { border: 'border-indigo-500', bg: 'bg-indigo-100' },
};

export default function Services({ dict }: { dict: Dictionary }) {
  return (
    <section id="services" className="section-padding bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">{dict.services.title}</h2>
          <p className="text-xl text-gray-600">{dict.services.subtitle}</p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dict.services.items.map((item, idx) => {
            const c = colorMap[borderColors[idx % borderColors.length]!];
            return (
              <div
                key={idx}
                className={`card-hover bg-white rounded-2xl shadow-xl p-8 border-r-4 ${c.border} relative overflow-hidden`}
              >
                <div className={`absolute top-0 right-0 w-20 h-20 ${c.bg} rounded-full -mr-10 -mt-10`}></div>
                <div className="text-5xl mb-6 floating-animation">{item.icon}</div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">{item.title}</h3>
                <p className="text-gray-600">{item.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
