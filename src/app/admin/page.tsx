import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [users, pendingReviews, approvedReviews, newContacts, newEvaluations, recentContacts] =
    await Promise.all([
      prisma.user.count(),
      prisma.review.count({ where: { status: 'PENDING' } }),
      prisma.review.count({ where: { status: 'APPROVED' } }),
      prisma.contactRequest.count({ where: { status: 'NEW' } }),
      prisma.evaluation.count({ where: { status: 'NEW' } }),
      prisma.contactRequest.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true, fullName: true, email: true,
          subject: true, status: true, createdAt: true,
        },
      }),
    ]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">داشبورد</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <Card title="کاربران" value={users} color="blue" />
        <Card title="نظرات منتظر تایید" value={pendingReviews} color="yellow" />
        <Card title="نظرات تایید شده" value={approvedReviews} color="green" />
        <Card title="درخواست‌های جدید" value={newContacts} color="red" />
        <Card title="فرم‌های ارزیابی جدید" value={newEvaluations} color="purple" />
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">۵ درخواست اخیر</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-right py-2 px-3">نام</th>
              <th className="text-right py-2 px-3">ایمیل</th>
              <th className="text-right py-2 px-3">موضوع</th>
              <th className="text-right py-2 px-3">وضعیت</th>
              <th className="text-right py-2 px-3">تاریخ</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {recentContacts.map((c) => (
              <tr key={c.id}>
                <td className="py-2 px-3 font-medium">{c.fullName}</td>
                <td className="py-2 px-3 text-gray-600">{c.email}</td>
                <td className="py-2 px-3">{c.subject ?? '-'}</td>
                <td className="py-2 px-3">{c.status}</td>
                <td className="py-2 px-3 text-gray-500">
                  {new Date(c.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {recentContacts.length === 0 && (
              <tr><td colSpan={5} className="text-center py-6 text-gray-500">درخواستی ثبت نشده.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({
  title, value, color,
}: { title: string; value: number; color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' }) {
  const colors: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} text-white rounded-2xl shadow-lg p-5`}>
      <p className="text-sm opacity-90">{title}</p>
      <p className="text-4xl font-bold mt-2">{value.toLocaleString()}</p>
    </div>
  );
}
