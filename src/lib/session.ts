import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from './auth';
import { prisma } from './prisma';

/** Requires any authenticated user. Returns the session or a 401 response. */
export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'برای دسترسی باید وارد شوید' }, { status: 401 }), session: null };
  }
  return { error: null, session };
}

/**
 * Requires an authenticated user whose email is verified. Reads the latest
 * verification status from the database so it reflects changes made after login.
 */
export async function requireVerifiedUser() {
  const guard = await requireUser();
  if (guard.error) return guard;

  const user = await prisma.user.findUnique({
    where: { id: guard.session.user.id },
    select: { emailVerified: true },
  });
  if (!user?.emailVerified) {
    return {
      error: NextResponse.json({ error: 'برای این عملیات ابتدا ایمیل خود را تایید کنید' }, { status: 403 }),
      session: null,
    };
  }
  return guard;
}
