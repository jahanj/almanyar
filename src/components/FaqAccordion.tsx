'use client';

import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

export type FaqItem = { q: string; a: string };

/**
 * Accessible FAQ accordion built on Radix.
 * - Single-item open at a time, collapsible.
 * - Radix provides aria-expanded / aria-controls / id wiring and full keyboard
 *   support (Tab, Enter, Space, ArrowUp/ArrowDown, Home, End).
 * - Open/close animation runs via the data-state attribute + CSS only, no JS
 *   measurement of content height (smoother + cheaper).
 */
export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <Accordion.Root type="single" collapsible className="space-y-3">
      {items.map((item, i) => (
        <Accordion.Item
          key={i}
          value={`item-${i}`}
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow"
        >
          <Accordion.Header className="flex">
            <Accordion.Trigger
              className="group flex w-full items-center justify-between gap-3 px-6 py-4 text-right text-base font-bold text-gray-800 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <span>{item.q}</span>
              <ChevronDown
                className="h-5 w-5 shrink-0 text-brand-600 transition-transform duration-200 group-data-[state=open]:rotate-180"
                aria-hidden="true"
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="cj-faq-content overflow-hidden border-t border-gray-100 text-gray-600">
            <div className="whitespace-pre-wrap px-6 py-4 leading-8">{item.a}</div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
