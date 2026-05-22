/**
 * Single source of truth for primary navigation. Header and Footer both read
 * this; do not hardcode links in either component.
 *
 * `dictKey` resolves to `dict.nav[dictKey]` for the visible label.
 * `path` is the locale-relative path; `hash` is an in-page anchor that lives
 * on the homepage (Header turns it into `/<locale>#…`).
 */
export type NavKey = 'services' | 'process' | 'guide' | 'turkey' | 'contact';

export type NavItem =
  | { dictKey: NavKey; hash: string; path?: never }
  | { dictKey: NavKey; path: string; hash?: never };

export const PRIMARY_NAV: NavItem[] = [
  { dictKey: 'services', hash: '#services' },
  { dictKey: 'process', hash: '#process' },
  { dictKey: 'guide', path: '/guide' },
  { dictKey: 'turkey', path: '/turkey-residence' },
  { dictKey: 'contact', hash: '#contact' },
];
