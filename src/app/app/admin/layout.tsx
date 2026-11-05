import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { isAdmin } from '@/lib/roles';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!isAdmin(session)) redirect('/app');
  return children;
}
