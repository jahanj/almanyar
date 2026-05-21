import type { Dictionary } from '@/lib/i18n';

const stepColors = [
  { from: 'from-blue-500', to: 'to-blue-600', text: 'text-blue-600' },
  { from: 'from-green-500', to: 'to-green-600', text: 'text-green-600' },
  { from: 'from-purple-500', to: 'to-purple-600', text: 'text-purple-600' },
  { from: 'from-red-500', to: 'to-red-600', text: 'text-red-600' },
  { from: 'from-yellow-500', to: 'to-yellow-600', text: 'text-yellow-600' },
  { from: 'from-indigo-500', to: 'to-indigo-600', text: 'text-indigo-600' },
];

export default function Process({ dict }: { dict: Dictionary }) {
  return (
    <section id="process" className="section-padding bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">{dict.process.title}</h2>
          <p className="text-xl text-gray-600">{dict.process.subtitle}</p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          {dict.process.steps.map((step, idx) => {
            const c = stepColors[idx % stepColors.length]!;
            return (
              <div key={idx} className="flex items-start gap-6">
                <div
                  className={`flex-shrink-0 w-16 h-16 bg-gradient-to-r ${c.from} ${c.to} text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg`}
                >
                  {idx + 1}
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 flex-1">
                  <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-800">{step.title}</h3>
                  <p className="text-gray-600 mb-3">{step.text}</p>
                  <div className={`flex items-center text-sm ${c.text}`}>
                    <span className="ml-2">⏱️</span>
                    <span>{step.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
