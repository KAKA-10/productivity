'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRightLeft, Trash2, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, Select } from '@/components/ui/field';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { strictApi } from '@/lib/strict-api';

type Staff = { id: string; fullName: string; username: string; role: string; status: string };
type Branch = { id: string; name: string; status: string };
type Organisation = { id: string; name: string; status: string; branches: Branch[] };
type Assignment = {
  id: string;
  staff: Staff;
  organisation: { id: string; name: string };
  branch: { id: string; name: string } | null;
};

export default function AdminAssignmentsPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [staffId, setStaffId] = useState('');
  const [organisationId, setOrganisationId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [accounts, clients, assigned] = await Promise.all([
        strictApi<Staff[]>('/api/admin/users'),
        strictApi<Organisation[]>('/api/admin/organisations'),
        strictApi<Assignment[]>('/api/admin/assignments'),
      ]);
      const activeStaff = accounts.filter((account) => ['technical', 'trainee', 'intern'].includes(account.role) && account.status === 'active');
      const activeOrganisations = clients.filter((organisation) => organisation.status === 'active');
      setStaff(activeStaff);
      setOrganisations(activeOrganisations);
      setAssignments(assigned);
      setStaffId((current) => activeStaff.some((account) => account.id === current) ? current : activeStaff[0]?.id ?? '');
      setOrganisationId((current) => activeOrganisations.some((organisation) => organisation.id === current) ? current : activeOrganisations[0]?.id ?? '');
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load staff assignments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const selectedOrganisation = useMemo(
    () => organisations.find((organisation) => organisation.id === organisationId),
    [organisations, organisationId],
  );
  const activeBranches = selectedOrganisation?.branches.filter((branch) => branch.status === 'active') ?? [];

  const createAssignment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await strictApi<Assignment>('/api/admin/assignments', {
        method: 'POST',
        body: JSON.stringify({ staffId, organisationId, branchId }),
      });
      toast.success('Client assigned to staff member');
      setBranchId('');
      await loadData();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to assign this client');
    } finally {
      setSaving(false);
    }
  };

  const removeAssignment = async (assignment: Assignment) => {
    if (!window.confirm(`Remove ${assignment.staff.fullName}'s access to ${assignment.organisation.name}?`)) return;
    try {
      await strictApi<{ ok: boolean }>('/api/admin/assignments', {
        method: 'DELETE',
        body: JSON.stringify({ id: assignment.id }),
      });
      toast.success('Assignment removed');
      await loadData();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to remove assignment');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Staff assignments"
        description="Give Technical staff, trainees, and interns access to a complete client workplace or selected branches."
      />
      {error ? <p role="alert" className="rounded-xl border border-clay-200 bg-clay-50 p-4 text-sm text-clay-700">{error}</p> : null}
      <form onSubmit={createAssignment} className="grid gap-4 rounded-2xl border border-forest-100 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-4"><h2 className="font-bold">Create assignment</h2><p className="mt-1 text-xs text-slate-500">Selecting all branches grants access to the entire client organisation.</p></div>
        <Field label="Staff member or intern"><Select required value={staffId} onChange={(event) => setStaffId(event.target.value)}><option value="">Choose a person</option>{staff.map((account) => <option key={account.id} value={account.id}>{account.fullName} · {account.role.replaceAll('_', ' ')}</option>)}</Select></Field>
        <Field label="Client workplace"><Select required value={organisationId} onChange={(event) => { setOrganisationId(event.target.value); setBranchId(''); }}><option value="">Choose client</option>{organisations.map((organisation) => <option key={organisation.id} value={organisation.id}>{organisation.name}</option>)}</Select></Field>
        <Field label="Branch scope"><Select value={branchId} onChange={(event) => setBranchId(event.target.value)}><option value="">All branches</option>{activeBranches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</Select></Field>
        <div className="flex items-end"><Button type="submit" disabled={saving || !staffId || !organisationId}><ArrowRightLeft className="h-4 w-4" />{saving ? 'Assigning…' : 'Assign client'}</Button></div>
      </form>
      {loading ? <Skeleton className="h-72 rounded-2xl" /> : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Staff member</th><th className="px-4 py-3">Client workplace</th><th className="px-4 py-3">Access scope</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td className="px-4 py-4"><p className="flex items-center gap-2 font-semibold"><UserRound className="h-4 w-4 text-slate-400" />{assignment.staff.fullName}</p><p className="ml-6 text-xs text-slate-500">{assignment.staff.role}</p></td>
                  <td className="px-4 py-4">{assignment.organisation.name}</td>
                  <td className="px-4 py-4">{assignment.branch?.name ?? 'All branches'}</td>
                  <td className="px-4 py-4"><Badge tone={assignment.staff.status === 'active' ? 'completed' : 'clay'}>{assignment.staff.status}</Badge></td>
                  <td className="px-4 py-4 text-right"><Button size="sm" variant="ghost" aria-label={`Remove assignment for ${assignment.staff.fullName}`} onClick={() => void removeAssignment(assignment)}><Trash2 className="h-4 w-4 text-clay-700" /></Button></td>
                </tr>
              ))}
              {!assignments.length ? <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">No client assignments yet.</td></tr> : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
