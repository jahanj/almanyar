'use client';

import { useState } from 'react';

export type FaqItem = { q: string; a: string };

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex justify-between items-center text-right px-6 py-4 font-bold text-gray-800 hover:bg-gray-50 transition"
          >
            <span>{item.q}</span>
            <span className={`text-blue-600 text-2xl transition-transform ${open === i ? 'rotate-45' : ''}`}>+</span>
          </button>
          {open === i && (
            <div className="px-6 pb-5 text-gray-600 leading-8 whitespace-pre-wrap border-t border-gray-100 pt-4">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
