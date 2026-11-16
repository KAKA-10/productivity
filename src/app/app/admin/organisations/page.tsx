'use client';

import { useCallback, useEffect, useState } from 'react';
import { Building2, MapPin, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, Select, TextInput } from '@/components/ui/field';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { KENYAN_COUNTIES } from '@/lib/commerce-catalog';
import { strictApi } from '@/lib/strict-api';

type Branch = {
  id: string;
  name: string;
  county: string;
  subCounty: string;
  town: string;
  poBox: string;
  status: string;
};

type Organisation = {
  id: string;
  name: string;
  status: string;
  branches: Branch[];
};

type LocationForm = {
  name: string;
  branchName: string;
  county: string;
  subCounty: string;
  town: string;
  poBox: string;
};

const emptyOrganisation: LocationForm = {
  name: '',
  branchName: '',
  county: 'Nairobi',
  subCounty: '',
  town: '',
  poBox: '',
};
const emptyBranch = { name: '', county: 'Nairobi', subCounty: '', town: '', poBox: '' };

export default function AdminOrganisationsPage() {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creatingOrganisation, setCreatingOrganisation] = useState(false);
  const [savingOrganisation, setSavingOrganisation] = useState(false);
  const [organisationForm, setOrganisationForm] = useState(emptyOrganisation);
  const [selectedOrganisationId, setSelectedOrganisationId] = useState('');
  const [branchForm, setBranchForm] = useState(emptyBranch);
  const [savingBranch, setSavingBranch] = useState(false);

  const loadOrganisations = useCallback(async () => {
    try {
      const result = await strictApi<Organisation[]>('/api/admin/organisations');
      setOrganisations(result);
      setError('');
      setSelectedOrganisationId((current) =>
        result.some((organisation) => organisation.id === current)
          ? current
          : result.find((organisation) => organisation.status === 'active')?.id ?? '',
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load client workplaces');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadOrganisations(); }, [loadOrganisations]);

  const createOrganisation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingOrganisation(true);
    try {
      const created = await strictApi<Organisation>('/api/admin/organisations', {
        method: 'POST',
        body: JSON.stringify(organisationForm),
      });
      toast.success('Client workplace and first branch created');
      setOrganisationForm(emptyOrganisation);
      setCreatingOrganisation(false);
      await loadOrganisations();
      setSelectedOrganisationId(created.id);
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to create client workplace');
    } finally {
      setSavingOrganisation(false);
    }
  };

  const createBranch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedOrganisationId) return;
    setSavingBranch(true);
    try {
      await strictApi<Branch>(`/api/admin/organisations/${selectedOrganisationId}/branches`, {
        method: 'POST',
        body: JSON.stringify(branchForm),
      });
      toast.success('Branch added');
      setBranchForm(emptyBranch);
      await loadOrganisations();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to add branch');
    } finally {
      setSavingBranch(false);
    }
  };

  const deactivateBranch = async (branch: Branch) => {
    if (!window.confirm(`Deactivate ${branch.name}? Existing audit history will be retained.`)) return;
    try {
      await strictApi<{ id: string; status: string }>(
        `/api/admin/organisations/${branch.id}/branches`,
        { method: 'DELETE' },
      );
      toast.success('Branch deactivated');
      await loadOrganisations();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to deactivate branch');
    }
  };

  const reactivateBranch = async (branch: Branch) => {
    try {
      await strictApi<{ id: string; status: string }>(
        `/api/admin/organisations/${branch.id}/branches`,
        { method: 'PATCH' },
      );
      toast.success('Branch reactivated');
      await loadOrganisations();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to reactivate branch');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Clients & branches"
        description="Organise each client workplace and manage branch access without removing historical records."
        actions={<Button onClick={() => setCreatingOrganisation((current) => !current)}><Plus className="h-4 w-4" />{creatingOrganisation ? 'Close form' : 'Add client'}</Button>}
      />
      {error ? <p role="alert" className="rounded-xl border border-clay-200 bg-clay-50 p-4 text-sm text-clay-700">{error}</p> : null}
      {creatingOrganisation ? (
        <form onSubmit={createOrganisation} className="space-y-4 rounded-2xl border border-forest-100 bg-white p-5 shadow-sm">
          <div><h2 className="font-bold">Create client workplace</h2><p className="mt-1 text-xs text-slate-500">A first branch is required. Add further locations below.</p></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Workplace / organisation"><TextInput required maxLength={160} value={organisationForm.name} onChange={(event) => setOrganisationForm({ ...organisationForm, name: event.target.value })} /></Field>
            <Field label="First branch"><TextInput required maxLength={120} value={organisationForm.branchName} onChange={(event) => setOrganisationForm({ ...organisationForm, branchName: event.target.value })} /></Field>
            <Field label="County"><Select required value={organisationForm.county} onChange={(event) => setOrganisationForm({ ...organisationForm, county: event.target.value })}>{KENYAN_COUNTIES.map((county) => <option key={county}>{county}</option>)}</Select></Field>
            <Field label="Sub-county"><TextInput maxLength={160} value={organisationForm.subCounty} onChange={(event) => setOrganisationForm({ ...organisationForm, subCounty: event.target.value })} /></Field>
            <Field label="Town"><TextInput maxLength={160} value={organisationForm.town} onChange={(event) => setOrganisationForm({ ...organisationForm, town: event.target.value })} /></Field>
            <Field label="P.O. Box"><TextInput maxLength={160} value={organisationForm.poBox} onChange={(event) => setOrganisationForm({ ...organisationForm, poBox: event.target.value })} /></Field>
          </div>
          <div className="flex justify-end"><Button type="submit" disabled={savingOrganisation}>{savingOrganisation ? 'Creating…' : 'Create client'}</Button></div>
        </form>
      ) : null}
      <form onSubmit={createBranch} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-4"><h2 className="font-bold">Add a branch</h2></div>
        <Field label="Client workplace"><Select required value={selectedOrganisationId} onChange={(event) => setSelectedOrganisationId(event.target.value)}><option value="">Choose workplace</option>{organisations.filter((organisation) => organisation.status === 'active').map((organisation) => <option key={organisation.id} value={organisation.id}>{organisation.name}</option>)}</Select></Field>
        <Field label="Branch name"><TextInput required maxLength={120} value={branchForm.name} onChange={(event) => setBranchForm({ ...branchForm, name: event.target.value })} /></Field>
        <Field label="County"><Select required value={branchForm.county} onChange={(event) => setBranchForm({ ...branchForm, county: event.target.value })}>{KENYAN_COUNTIES.map((county) => <option key={county}>{county}</option>)}</Select></Field>
        <Field label="Sub-county"><TextInput maxLength={160} value={branchForm.subCounty} onChange={(event) => setBranchForm({ ...branchForm, subCounty: event.target.value })} /></Field>
        <Field label="Town"><TextInput maxLength={160} value={branchForm.town} onChange={(event) => setBranchForm({ ...branchForm, town: event.target.value })} /></Field>
        <Field label="P.O. Box"><TextInput maxLength={160} value={branchForm.poBox} onChange={(event) => setBranchForm({ ...branchForm, poBox: event.target.value })} /></Field>
        <div className="flex items-end lg:col-span-2"><Button type="submit" disabled={savingBranch || !selectedOrganisationId}>{savingBranch ? 'Adding…' : 'Add branch'}</Button></div>
      </form>
      {loading ? <Skeleton className="h-72 rounded-2xl" /> : (
        <div className="space-y-4">
          {organisations.map((organisation) => (
            <section key={organisation.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <header className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-700"><Building2 className="h-5 w-5" /></span><div><h2 className="font-bold">{organisation.name}</h2><p className="text-xs text-slate-500">{organisation.branches.length} branch{organisation.branches.length === 1 ? '' : 'es'}</p></div></div>
                <Badge tone={organisation.status === 'active' ? 'completed' : 'clay'}>{organisation.status}</Badge>
              </header>
              <div className="divide-y divide-slate-100">
                {organisation.branches.map((branch) => (
                  <div key={branch.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 text-slate-400" /><div><p className="font-semibold">{branch.name}</p><p className="text-xs text-slate-500">{[branch.county, branch.subCounty, branch.town, branch.poBox].filter(Boolean).join(' · ') || 'No location details'}</p></div></div>
                    <div className="flex items-center gap-2"><Badge tone={branch.status === 'active' ? 'completed' : 'clay'}>{branch.status}</Badge>{branch.status === 'active' ? <Button size="sm" variant="ghost" aria-label={`Deactivate ${branch.name}`} onClick={() => void deactivateBranch(branch)}><Trash2 className="h-4 w-4 text-clay-700" /></Button> : <Button size="sm" variant="secondary" onClick={() => void reactivateBranch(branch)}>Reactivate</Button>}</div>
                  </div>
                ))}
                {!organisation.branches.length ? <p className="px-5 py-4 text-sm text-slate-500">No branches have been added.</p> : null}
              </div>
            </section>
          ))}
          {!organisations.length ? <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No client workplaces yet.</p> : null}
        </div>
      )}
    </div>
  );
}
