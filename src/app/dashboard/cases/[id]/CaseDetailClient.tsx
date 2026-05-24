'use client';

import { useState, useCallback } from 'react';
import RoadmapTimeline, { type Task } from '@/components/dashboard/RoadmapTimeline';

type CaseInitial = {
  id: string;
  title: string;
  type: string;
  status: string;
  adminNotes?: string | null;
  createdAt: string;
  tasks: Task[];
};

const APP_TYPE_LABEL: Record<string, string> = {
  STUDENT_GERMANY: 'تحصیل در آلمان',
  STUDENT_TURKEY: 'اقامت تحصیلی ترکیه',
  AUSBILDUNG: 'اوسبیلدونگ',
  OTHER: 'سایر',
};

/**
 * Phase-5 — focused single-case panel. Re-fetches /api/applications on
 * any tick (mirroring DashboardClient's pattern) so the timeline always
 * reflects fresh adminTicked state without a manual refresh.
 */
export default function CaseDetailClient({ initial }: { initial: CaseInitial }) {
  const [data, setData] = useState<CaseInitial>(initial);

  const reload = useCallback(async () => {
    const res = await fetch('/api/applications');
    if (!res.ok) return;
    const json = await res.json();
    const fresh = (json.applications as Array<CaseInitial & { tasks: Task[] }>).find(
      (a) => a.id === initial.id,
    );
    if (fresh) setData((prev) => ({ ...prev, ...fresh, tasks: fresh.tasks ?? prev.tasks }));
  }, [initial.id]);

  const total = data.tasks.length;
  const done = data.tasks.filter((t) => t.adminTicked).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{data.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {APP_TYPE_LABEL[data.type] ?? data.type} ·
            از {new Date(data.createdAt).toLocaleDateString('fa-IR')}
          </p>
        </div>
      </div>

      {data.adminNotes && (
        <div className="bg-amber-50 border-r-4 border-amber-400 rounded-lg p-3 mb-6 text-sm text-amber-800">
          📋 پیام کارشناس: {data.adminNotes}
        </div>
      )}

      {total > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>پیشرفت کلی پرونده</span>
            <span>{done} از {total} گام ({pct}%)</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${pct}%` }}
              data-testid="progress-bar"
            />
          </div>
        </div>
      )}

      <h2 className="font-semibold text-gray-700 mb-3">پنل گام‌های شما</h2>
      <RoadmapTimeline applicationId={data.id} tasks={data.tasks} onChange={reload} />
    </div>
  );
}
