'use client';

import { useEffect, useState } from 'react';
import { WHATSAPP_URL } from '@/config/contact';
import WhatsAppIcon from './WhatsAppIcon';

/**
 * Floating WhatsApp CTA, site-wide on public marketing pages.
 *
 * - Bottom-left (RTL site → thumb side for right-handed users).
 * - Brand green (#25D366) with the official WhatsApp glyph.
 * - z-index 40 — sits BELOW the cookie notice (z-50) so first-visit
 *   consent isn't blocked by the button.
 * - Hidden on /admin, /dashboard, auth routes. Those layouts manage
 *   their own chrome; a floating CTA there is noise.
 *
 * Mounted from [locale]/layout.tsx — so it only ever renders inside
 * the /fa segment. The path check is belt-and-suspenders.
 */

const HIDE_ON_PREFIXES = ['/admin', '/dashboard', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

export default function WhatsAppButton() {
  // Avoid SSR/CSR mismatch: pathname only exists client-side. Render after
  // mount; one-render delay is fine for a non-critical CTA.
  const [path, setPath] = useState<string | null>(null);
  useEffect(() => {
    setPath(window.location.pathname);
  }, []);

  if (path === null) return null;
  if (HIDE_ON_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) return null;

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="گفت‌وگو در واتساپ"
      data-testid="floating-whatsapp"
      className="fixed bottom-6 start-6 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-card transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
