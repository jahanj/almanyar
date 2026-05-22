/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';

// Content Security Policy. 'unsafe-inline' for styles is needed by Tailwind/Next inline styles.
// Scripts allow 'unsafe-inline'/'unsafe-eval' only in dev (Next.js HMR).
const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
];

const securityHeaders = [
  { key: 'Content-Security-Policy', value: cspDirectives.join('; ') },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  ...(!isDev
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
    : []),
];

// Legacy un-prefixed public marketing routes that have moved under /[locale].
// 301 (permanent) so search engines transfer link equity.
const LEGACY_GROUPS = [
  'germany-visa',
  'germany-visa-from-turkey',
  'study-germany',
  'work-germany',
  'jobs-germany',
  'life-germany',
  'exams',
  'ausbildung',
  'germany-embassy',
  'services',
  'faq',
];

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'fonts.googleapis.com' },
      { protocol: 'https', hostname: 'fonts.gstatic.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return LEGACY_GROUPS.flatMap((group) => [
      { source: `/${group}`,              destination: `/fa/${group}`,              permanent: true },
      { source: `/${group}/:slug*`,       destination: `/fa/${group}/:slug*`,       permanent: true },
    ]);
  },
};

module.exports = nextConfig;
