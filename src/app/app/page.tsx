import { getSession } from '@/lib/auth';
import { isAdmin } from '@/lib/roles';
import { UserDashboard } from '@/components/user-dashboard';
import { AdminDashboard } from '@/components/admin-dashboard';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) redirect('/login');
  if (isAdmin(session)) return <AdminDashboard />;
  return <UserDashboard user={{
    fullName: session.fullName,
    organisation: session.organisation,
    auditAccess: session.auditAccess ?? false,
    unlockedFeatures: session.unlockedFeatures ?? [],
  }} />;
}
