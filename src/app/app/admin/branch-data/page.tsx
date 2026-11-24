import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { isSuperAdmin } from '@/lib/roles';
import { BranchDataBrowser } from '@/components/branch-data-browser';

export default async function BranchDataPage() {
  const session = await getSession();
  if (!isSuperAdmin(session)) redirect('/app');
  return <BranchDataBrowser />;
}
