import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';

export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const [
    totalUsers,
    pendingReviews,
    approvedReviews,
    newContacts,
    inProgressContacts,
    recentContacts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.review.count({ where: { status: 'PENDING' } }),
    prisma.review.count({ where: { status: 'APPROVED' } }),
    prisma.contactRequest.count({ where: { status: 'NEW' } }),
    prisma.contactRequest.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.contactRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        fullName: true,
        email: true,
        subject: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  return NextResponse.json({
    totals: {
      users: totalUsers,
      reviews: {
        pending: pendingReviews,
        approved: approvedReviews,
      },
      contacts: {
        new: newContacts,
        inProgress: inProgressContacts,
      },
    },
    recentContacts,
  });
}
