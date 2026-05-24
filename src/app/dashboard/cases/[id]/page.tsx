import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import CaseDetailClient from './CaseDetailClient';

export const dynamic = 'force-dynamic';

/**
 * Phase-5 TASK-05 (Decision F) — focused single-Application view.
 *
 * Loads the case server-side so the user never sees a flash of
 * "loading…" before the roadmap appears. Cross-user 404 (not 403)
 * for consistency with the API.
 */
export default async function CaseDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/login?callbackUrl=/dashboard/cases/${params.id}`);
  }

  const app = await prisma.application.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      documents: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, category: true, status: true, originalName: true,
          mimeType: true, size: true, reviewNote: true, createdAt: true,
        },
      },
      tasks: {
        orderBy: { order: 'asc' },
        select: {
          id: true, order: true, title: true, description: true,
          category: true, status: true, requiredDocCategory: true,
          studentTicked: true, studentTickedAt: true,
          adminTicked: true, adminTickedAt: true,
          dueDate: true, createdAt: true, updatedAt: true,
        },
      },
    },
  });

  if (!app) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
          ← بازگشت به پرونده‌ها
        </Link>
      </div>
      <CaseDetailClient
        initial={{
          id: app.id,
          title: app.title,
          type: app.type,
          status: app.status,
          adminNotes: app.adminNotes,
          createdAt: app.createdAt.toISOString(),
          tasks: app.tasks.map((t) => ({
            ...t,
            studentTickedAt: t.studentTickedAt?.toISOString() ?? null,
            adminTickedAt: t.adminTickedAt?.toISOString() ?? null,
            dueDate: t.dueDate?.toISOString() ?? null,
          })),
        }}
      />
    </div>
  );
}
