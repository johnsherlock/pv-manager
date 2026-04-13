'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/auth';
import { db } from '@/src/db/client';
import { users } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sendApprovalEmail } from '@/src/email/approval';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function approveUser(userId: string) {
  const session = await requireAdmin();

  const target = await db
    .select({ id: users.id, email: users.email, status: users.status })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!target[0] || target[0].status !== 'awaiting_approval') {
    throw new Error('User not found or not awaiting approval');
  }

  await db
    .update(users)
    .set({
      status: 'approved',
      approvedAt: new Date(),
      approvedBy: session.userId,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  await sendApprovalEmail(target[0].email);

  revalidatePath('/admin/users');
}

export async function startImpersonation(targetUserId: string) {
  const session = await requireAdmin();

  const target = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, targetUserId))
    .limit(1);

  if (!target[0]) throw new Error('User not found');

  const cookieStore = await cookies();
  cookieStore.set('impersonating_user_id', target[0].id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
  cookieStore.set('impersonating_user_email', target[0].email, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });

  void session; // admin session stays intact
  redirect('/live');
}

export async function stopImpersonation() {
  await requireAdmin();

  const cookieStore = await cookies();
  cookieStore.delete('impersonating_user_id');
  cookieStore.delete('impersonating_user_email');

  redirect('/admin/users');
}
