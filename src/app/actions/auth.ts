'use server';

import { db } from '@/lib/db';
import { allowedUsers, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: { error: string } | null, formData: FormData) {
  const email = formData.get('email') as string;

  if (!email) {
    return { error: 'Email is required' };
  }

  // 1. Check if email is allowed
  const allowed = await db.select().from(allowedUsers).where(eq(allowedUsers.email, email)).limit(1);

  if (allowed.length === 0) {
    return { error: 'Email not authorized' };
  }

  // 2. Find or create user
  let user = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (user.length === 0) {
    const newUser = await db.insert(users).values({ email }).returning();
    user = newUser;
  }

  if (!user[0]) {
      return { error: 'Failed to create user' };
  }

  // 3. Set session cookie
  const cookieStore = await cookies(); // await next/headers cookies()
  cookieStore.set('userId', user[0].id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  redirect('/');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('userId');
  redirect('/login');
}
