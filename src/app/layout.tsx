import type { Metadata, Viewport } from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';
import NextAuthProvider from '@/components/SessionProvider';
import JsonLd from '@/components/JsonLd';
import { SITE, organizationLd, websiteLd } from '@/lib/seo';

// Self-hosted, swap-displayed Persian font: no render-blocking Google Fonts
// request and no layout shift (better LCP/CLS / Core Web Vitals).
const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-vazir',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'مهاجرت تحصیلی به آلمان از ترکیه | آلمانیار',
    template: '%s',
  },
  description: 'خدمات تخصصی مهاجرت تحصیلی به آلمان از مسیر ترکیه؛ اقامت تحصیلی، انتخاب دانشگاه و اخذ ویزای دانشجویی.',
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  formatDetection: { telephone: true, email: true, address: true },
  icons: { icon: '/favicon.png', apple: '/favicon.png' },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: 'fa_IR',
    url: SITE.url,
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: { card: 'summary_large_image', site: SITE.twitter, images: [SITE.ogImage] },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1a0e0e',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="persian-font bg-slate-50 text-slate-800 antialiased">
        <JsonLd data={[organizationLd(), websiteLd()]} />
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
