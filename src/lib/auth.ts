import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function getSession() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  return userId;
}

export async function requireUser() {
  const userId = await getSession();
  if (!userId) {
    redirect('/login');
  }
  return userId;
}
