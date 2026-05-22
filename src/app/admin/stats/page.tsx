import { loadSiteStats } from '@/lib/site-stats';
import StatsForm from './StatsForm';

export const dynamic = 'force-dynamic';

export default async function AdminStatsPage() {
  const stats = await loadSiteStats();
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">آمار صفحه اصلی</h1>
      <p className="text-gray-600 mb-8 leading-7">
        این اعداد در بخش بالای صفحه اصلی نمایش داده می‌شوند. هر مقدار را خالی بگذارید
        تا کارت مربوطه از صفحه پنهان شود. اگر نظرات تایید شده در سایت ثبت شده باشد،
        تعداد و میانگین ستاره به‌صورت خودکار از دیتابیس بازخوانی می‌شود و مقدار دستی
        نادیده گرفته می‌شود.
      </p>
      <StatsForm initial={stats} />
    </div>
  );
}
