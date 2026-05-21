'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import type { Dictionary } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

export default function Header({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const switchLocale = (next: string) => {
    document.cookie = `locale=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
    const rest = pathname.replace(/^\/(fa|tr|de)/, '');
    router.push(`/${next}${rest || ''}`);
  };

  const links = [
    { href: `/${locale}#services`, label: dict.nav.services },
    { href: `/${locale}#process`, label: dict.nav.process },
    { href: `/${locale}#education`, label: dict.nav.education },
    { href: `/${locale}/guide`, label: dict.nav.guide },
    { href: `/${locale}/turkey-residence`, label: dict.nav.turkey },
    { href: `/${locale}/turkey-costs`, label: dict.nav.turkeyCosts },
    { href: `/${locale}#living-costs`, label: dict.nav.livingCosts },
    { href: `/${locale}#ausbildung`, label: dict.nav.ausbildung },
    { href: `/${locale}#testimonials`, label: dict.nav.testimonials },
    { href: `/${locale}#contact`, label: dict.nav.contact },
  ];

  return (
    <header className="flag-bg text-white shadow-2xl fixed w-full top-0 z-50">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center gap-4">
          <Link href={`/${locale}`} className="text-2xl font-bold text-shadow whitespace-nowrap">
            🇩🇪 {dict.meta.title}
          </Link>

          <Link
            href={`/${locale}/evaluation`}
            className="hidden lg:inline-block bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2 rounded-lg text-sm whitespace-nowrap transition"
          >
            {dict.nav.evaluation}
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-yellow-300 transition font-medium">
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={locale}
              onChange={(e) => switchLocale(e.target.value)}
              className="bg-white/20 border border-white/30 text-white rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
            >
              <option value="fa" className="text-gray-800">🇮🇷 فارسی</option>
              <option value="tr" className="text-gray-800">🇹🇷 Türkçe</option>
              <option value="de" className="text-gray-800">🇩🇪 Deutsch</option>
            </select>

            {session?.user ? (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/dashboard" className="bg-white/20 px-3 py-1 rounded-lg font-medium text-sm hover:bg-white/30">
                  {dict.nav.dashboard}
                </Link>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin" className="bg-yellow-500 text-gray-900 px-3 py-1 rounded-lg font-medium text-sm">
                    {dict.nav.adminPanel}
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: `/${locale}` })}
                  className="text-sm hover:text-yellow-300"
                >
                  {dict.nav.logout}
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2 text-sm">
                <Link href="/login" className="hover:text-yellow-300">{dict.nav.login}</Link>
                <span>/</span>
                <Link href="/register" className="hover:text-yellow-300">{dict.nav.register}</Link>
              </div>
            )}

            <button
              onClick={() => setOpen(!open)}
              className="md:hidden text-white"
              aria-label="menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden mt-4 bg-gray-900/95 rounded-xl p-4 space-y-3">
            <Link
              href={`/${locale}/evaluation`}
              onClick={() => setOpen(false)}
              className="block bg-green-600 text-white text-center font-bold px-4 py-2 rounded-lg"
            >
              {dict.nav.evaluation}
            </Link>
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block text-white hover:text-yellow-300"
              >
                {l.label}
              </a>
            ))}
            {session?.user ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="block text-white">
                  {dict.nav.dashboard}
                </Link>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin" className="block text-yellow-300">
                    {dict.nav.adminPanel}
                  </Link>
                )}
                <button onClick={() => signOut({ callbackUrl: `/${locale}` })} className="text-white">
                  {dict.nav.logout}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-white">{dict.nav.login}</Link>
                <Link href="/register" className="block text-white">{dict.nav.register}</Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
