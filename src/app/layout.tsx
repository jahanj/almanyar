import type { Metadata } from 'next';
import './globals.css';
import NextAuthProvider from '@/components/SessionProvider';

export const metadata: Metadata = {
  title: 'مهاجرت تحصیلی به آلمان',
  description: 'خدمات تخصصی مهاجرت تحصیلی به آلمان از مسیر ترکیه',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="persian-font bg-gray-50 text-gray-800">
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
