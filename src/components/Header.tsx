'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
import type { Dictionary, Locale } from '@/lib/i18n';
import { localePath } from '@/lib/i18n';
import { PRIMARY_NAV } from '@/config/navigation';

export default function Header({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();

  const primaryLinks = PRIMARY_NAV.map((item) => ({
    href: item.hash ? `/${locale}${item.hash}` : localePath(locale, item.path),
    label: dict.nav[item.dictKey],
  }));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [locale]);

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-slate-200/80 bg-white/90 shadow-soft backdrop-blur-md'
          : 'border-b border-transparent bg-white/70 backdrop-blur-sm',
      ].join(' ')}
    >
      <nav className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link href={`/${locale}`} className="flex shrink-0 items-center gap-3" aria-label={dict.meta.title}>
            <Image
              src="/logo.png"
              alt={dict.meta.title}
              width={1248}
              height={832}
              priority
              className="h-11 w-auto md:h-12"
            />
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {primaryLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                {link.label}
              </a>
            ))}
            <Link
              href={`/${locale}/evaluation`}
              className="ms-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              {dict.nav.evaluation}
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {session?.user ? (
              <div className="hidden items-center gap-2 md:flex">
                <Link
                  href="/dashboard"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  {dict.nav.dashboard}
                </Link>
                {session.user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    {dict.nav.adminPanel}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: `/${locale}` })}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                >
                  {dict.nav.logout}
                </button>
              </div>
            ) : (
              <div className="hidden items-center gap-2 text-sm md:flex">
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  {dict.nav.login}
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-800"
                >
                  {dict.nav.register}
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 lg:hidden"
              aria-label={open ? 'بستن منو' : 'باز کردن منو'}
              aria-expanded={open}
              aria-controls="mobile-navigation"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={open ? 'M6 6l12 12M6 18L18 6' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <div
            id="mobile-navigation"
            className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card lg:hidden"
          >
            <div className="grid gap-1">
              <Link
                href={`/${locale}/evaluation`}
                onClick={() => setOpen(false)}
                className="rounded-xl bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white"
              >
                {dict.nav.evaluation}
              </Link>

              {primaryLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  {link.label}
                </a>
              ))}

              <div className="mt-2 border-t border-slate-100 pt-2">
                {session?.user ? (
                  <div className="grid gap-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      {dict.nav.dashboard}
                    </Link>
                    {session.user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setOpen(false)}
                        className="rounded-xl px-4 py-3 text-sm font-semibold text-brand-700 hover:bg-slate-50"
                      >
                        {dict.nav.adminPanel}
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: `/${locale}` })}
                      className="rounded-xl px-4 py-3 text-start text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      {dict.nav.logout}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700"
                    >
                      {dict.nav.login}
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setOpen(false)}
                      className="rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white"
                    >
                      {dict.nav.register}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
