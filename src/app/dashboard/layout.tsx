import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ResendVerification from '@/components/ResendVerification';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard');
  }

  const account = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, emailVerified: true },
  });

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="flag-bg text-white shadow-lg">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">🇩🇪 پنل کاربری</Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="opacity-90">{session.user.name}</span>
            {session.user.role === 'ADMIN' && (
              <Link href="/admin" className="bg-yellow-500 text-gray-900 px-3 py-1 rounded-lg font-medium">پنل ادمین</Link>
            )}
            <Link href="/" className="hover:text-yellow-300">بازگشت به سایت</Link>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-10">
        {account && !account.emailVerified ? (
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-8 text-center">
            <div className="text-5xl mb-4">📧</div>
            <h1 className="text-2xl font-bold mb-3">ابتدا ایمیل خود را تایید کنید</h1>
            <p className="text-gray-600 mb-2">
              برای استفاده از پنل کاربری (ثبت پرونده و آپلود مدارک) باید ایمیل
              <span className="font-medium"> {account.email} </span>
              را تایید کنید.
            </p>
            <p className="text-gray-600 mb-6">لینک تایید را در ایمیل خود بررسی کنید.</p>
            <div className="flex justify-center"><ResendVerification email={account.email} /></div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
