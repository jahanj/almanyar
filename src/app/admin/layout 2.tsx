import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login?callbackUrl=/admin');
  }

  return (
    <div className="min-h-screen flex bg-gray-100" dir="rtl">
      <aside className="w-64 bg-gray-900 text-white p-6 sticky top-0 h-screen">
        <h2 className="text-2xl font-bold mb-6">پنل ادمین</h2>
        <nav className="space-y-2">
          <Link href="/admin" className="block px-3 py-2 rounded hover:bg-gray-800">📊 داشبورد</Link>
          <Link href="/admin/reviews" className="block px-3 py-2 rounded hover:bg-gray-800">⭐ نظرات</Link>
          <Link href="/admin/contacts" className="block px-3 py-2 rounded hover:bg-gray-800">📩 درخواست‌ها</Link>
          <Link href="/" className="block px-3 py-2 rounded hover:bg-gray-800 mt-6 text-yellow-400">↩ بازگشت به سایت</Link>
        </nav>
        <div className="mt-10 pt-6 border-t border-gray-700 text-sm">
          <p className="opacity-70">ورود به عنوان:</p>
          <p className="font-bold">{session.user.email}</p>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-x-auto">{children}</main>
    </div>
  );
}
