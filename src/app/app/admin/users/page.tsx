'use client';

import { useEffect, useState } from 'react';
import { KeyRound, LockKeyhole, Plus, Search, ShieldCheck, Trash2, UserRound, UserRoundX } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, Select, TextInput } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { strictApi } from '@/lib/strict-api';
import { KENYAN_COUNTIES } from '@/lib/commerce-catalog';
import type { AccountRole } from '@/lib/roles';

type Account = {
  id: string;
  username: string;
  fullName: string;
  role: AccountRole | 'user';
  organisation: string;
  branchId: string | null;
  branch: { name: string } | null;
  county: string;
  email: string | null;
  phone: string | null;
  status: string;
  createdAt: string;
  auditSubmission?: { status: string; updatedAt: string }[] | null;
};
type NewAccount = {
  username: string;
  password: string;
  fullName: string;
  organisation: string;
  county: string;
  email: string;
  phone: string;
  role: AccountRole;
  branchName: string;
};
const emptyForm: NewAccount = { username: '', password: '', fullName: '', organisation: '', county: 'Nairobi', email: '', phone: '', role: 'workplace_admin', branchName: '' };

export default function AdminUsersPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [creatingIntern, setCreatingIntern] = useState(false);
  const [busy, setBusy] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [pinTarget, setPinTarget] = useState<Account | null>(null);
  const [pin, setPin] = useState('');
  const [savingPin, setSavingPin] = useState(false);
  const [actorRole, setActorRole] = useState('');

  const loadAccounts = async () => {
    try {
      setAccounts(await strictApi<Account[]>('/api/admin/users'));
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load accounts');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void loadAccounts();
    strictApi<{ user: { role: string } | null }>('/api/auth/session')
      .then((result) => {
        if (!result.user) throw new Error('Unable to identify the signed-in administrator');
        setActorRole(result.user.role);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to identify the signed-in administrator'));
  }, []);

  const filtered = accounts.filter((account) =>
    `${account.username} ${account.fullName} ${account.organisation} ${account.branch?.name ?? ''} ${account.county} ${account.role}`.toLowerCase().includes(search.toLowerCase()),
  );
  const updateForm = <K extends keyof NewAccount>(key: K, value: NewAccount[K]) => setForm((current) => ({ ...current, [key]: value }));

  const createAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    try {
      await strictApi<Account>('/api/admin/users', { method: 'POST', body: JSON.stringify(form) });
      toast.success('Account created');
      setForm(emptyForm);
      setShowForm(false);
      setCreatingIntern(false);
      await loadAccounts();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to create account');
    } finally {
      setBusy(false);
    }
  };

  const toggleAccount = async (account: Account) => {
    if (!['active', 'suspended'].includes(account.status)) return;
    const action = account.status === 'active' ? 'suspend' : 'restore';
    if (!window.confirm(`${action === 'suspend' ? 'Suspend' : 'Restore'} ${account.fullName}'s account?`)) return;
    try {
      await strictApi<Account>(`/api/admin/users/${account.id}`, { method: 'PATCH', body: JSON.stringify({ action }) });
      toast.success(action === 'suspend' ? 'Account suspended' : 'Account restored');
      await loadAccounts();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to update account');
    }
  };

  const resetPassword = async (account: Account) => {
    if (!window.confirm(`Generate a temporary password for ${account.fullName}? Their current sessions will be signed out.`)) return;
    try {
      const result = await strictApi<{ temporaryPassword: string }>(`/api/admin/users/${account.id}`, { method: 'POST' });
      setTemporaryPassword(result.temporaryPassword);
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to reset password');
    }
  };

  const deleteAccount = async (account: Account) => {
    if (!window.confirm(`Deactivate ${account.fullName}'s account? Their records and audit history will be retained.`)) return;
    try {
      await strictApi<Account>(`/api/admin/users/${account.id}`, { method: 'DELETE' });
      toast.success('Account deactivated; its history was retained');
      await loadAccounts();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to deactivate account');
    }
  };

  const availableRoles: AccountRole[] = actorRole === 'super_admin'
    ? ['super_admin', 'admin', 'technical', 'trainee', 'intern', 'client_super_admin', 'workplace_admin']
    : ['technical', 'trainee', 'client_super_admin', 'workplace_admin'];

  const openInternForm = () => {
    setForm({ ...emptyForm, role: 'intern' });
    setCreatingIntern(true);
    setShowForm(true);
  };

  const setAccountPin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pinTarget) return;
    setSavingPin(true);
    try {
      await strictApi<{ ok: boolean }>(`/api/admin/users/${pinTarget.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'set_pin', pin }),
      });
      toast.success(`PIN updated for ${pinTarget.fullName}. They will need to sign in again.`);
      setPinTarget(null);
      setPin('');
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to set account PIN');
    } finally {
      setSavingPin(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Account directory"
        description="Create role-based access, manage client accounts, and retain an auditable account history."
        actions={<div className="flex flex-wrap gap-2">{actorRole === 'super_admin' ? <Button variant="secondary" disabled={!actorRole} onClick={openInternForm}><Plus className="h-4 w-4" /> Add intern</Button> : null}<Button disabled={!actorRole} onClick={() => { setCreatingIntern(false); setShowForm((value) => !value); }}>{showForm ? 'Close form' : 'Create account'}</Button></div>}
      />
      {error ? <p role="alert" className="rounded-xl border border-clay-200 bg-clay-50 p-4 text-sm text-clay-700">{error}</p> : null}
      {showForm ? (
        <form onSubmit={createAccount} className="rounded-2xl border border-forest-100 bg-white p-5 shadow-sm">
          <div className="mb-5"><h2 className="font-bold">{creatingIntern ? 'Add intern' : 'New account'}</h2><p className="mt-1 text-xs text-slate-500">{creatingIntern ? 'Create an intern account. It will be available in the client assignment list after saving.' : 'Use a unique username, select the workplace county, and set a password of at least 12 characters.'}</p></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Full name"><TextInput required maxLength={120} value={form.fullName} onChange={(event) => updateForm('fullName', event.target.value)} /></Field>
            <Field label="Username"><TextInput required minLength={3} maxLength={32} autoComplete="off" value={form.username} onChange={(event) => updateForm('username', event.target.value)} /></Field>
            {creatingIntern ? <Field label="Role"><TextInput value="Intern" readOnly /></Field> : <Field label="Role"><Select value={form.role} onChange={(event) => updateForm('role', event.target.value as AccountRole)}>{availableRoles.map((role) => <option key={role} value={role}>{role.replaceAll('_', ' ')}</option>)}</Select></Field>}
            {['client_super_admin', 'workplace_admin'].includes(form.role) ? <Field label="Workplace / organisation"><TextInput required maxLength={160} value={form.organisation} onChange={(event) => updateForm('organisation', event.target.value)} /></Field> : null}
            {['client_super_admin', 'workplace_admin'].includes(form.role) ? <Field label="Branch"><TextInput maxLength={120} placeholder="Existing branch name or new branch" value={form.branchName} onChange={(event) => updateForm('branchName', event.target.value)} /><span className="text-xs text-slate-500">{form.role === 'client_super_admin' ? 'Leave blank to include all branches.' : 'Enter an existing branch name or create a branch first.'}</span></Field> : null}
            <Field label="Workplace county"><Select required value={form.county} onChange={(event) => updateForm('county', event.target.value)}><option value="">Choose county</option>{KENYAN_COUNTIES.map((county) => <option key={county} value={county}>{county}</option>)}</Select></Field>
            <Field label="Email (optional)"><TextInput type="email" maxLength={254} value={form.email} onChange={(event) => updateForm('email', event.target.value)} /></Field>
            <Field label="Phone (optional)"><TextInput type="tel" maxLength={32} value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} /></Field>
            <Field label="Initial password"><TextInput required type="password" autoComplete="new-password" minLength={12} maxLength={128} value={form.password} onChange={(event) => updateForm('password', event.target.value)} /></Field>
          </div>
          <div className="mt-5 flex justify-end"><Button type="submit" disabled={busy}>{busy ? 'Creating…' : creatingIntern ? 'Create intern' : 'Create account'}</Button></div>
        </form>
      ) : null}
      {temporaryPassword ? (
        <div role="status" className="rounded-2xl border border-safety-200 bg-safety-50 p-5">
          <div className="flex items-start gap-3"><KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-safety-700" /><div className="min-w-0"><h2 className="font-bold text-safety-900">Temporary password generated</h2><p className="mt-1 text-sm text-safety-800">Share it securely with the account holder. They should change it after signing in.</p><code className="mt-3 block overflow-x-auto rounded-lg bg-white p-3 font-mono text-sm">{temporaryPassword}</code><Button size="sm" variant="ghost" className="mt-2" onClick={() => setTemporaryPassword('')}>Dismiss</Button></div></div>
        </div>
      ) : null}
      {pinTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation">
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="pin-dialog-title"
            onSubmit={(event) => void setAccountPin(event)}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <h2 id="pin-dialog-title" className="mt-4 font-bold text-ink">Set unlock PIN</h2>
            <p className="mt-1 text-sm text-slate-500">
              Set a six-digit PIN for {pinTarget.fullName}. Share it through a secure channel. Their existing sessions will be signed out.
            </p>
            <Field label="Six-digit PIN">
              <TextInput
                autoComplete="new-password"
                inputMode="numeric"
                pattern="[0-9]{6}"
                required
                type="password"
                maxLength={6}
                value={pin}
                onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </Field>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => { setPinTarget(null); setPin(''); }}>Cancel</Button>
              <Button type="submit" disabled={savingPin || pin.length !== 6}>{savingPin ? 'Saving…' : 'Set PIN'}</Button>
            </div>
          </form>
        </div>
      ) : null}
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3">
        <Search className="h-4 w-4 text-slate-400" />
        <input aria-label="Search accounts" className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search people, workplaces or roles" value={search} onChange={(event) => setSearch(event.target.value)} />
        <span className="text-xs text-slate-400">{filtered.length} accounts</span>
      </div>
      {loading ? <Skeleton className="h-72 rounded-2xl" /> : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Account</th><th className="px-4 py-3">Access</th><th className="px-4 py-3">Audit submission</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((account) => (
                <tr key={account.id}>
                  <td className="px-4 py-4"><p className="font-semibold">{account.fullName}</p><p className="text-xs text-slate-500">@{account.username} · {account.organisation || 'Productivity staff'}{account.branch?.name ? ` · ${account.branch.name}` : ''} · {account.county}</p></td>
                  <td className="px-4 py-4"><span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">{['admin', 'super_admin'].includes(account.role) ? <ShieldCheck className="h-4 w-4 text-forest-600" /> : <UserRound className="h-4 w-4" />}{account.role.replaceAll('_', ' ')}</span></td>
                  <td className="px-4 py-4 text-xs text-slate-600">{account.auditSubmission?.[0] ? account.auditSubmission[0].status.replaceAll('_', ' ') : 'Not started'}</td>
                  <td className="px-4 py-4"><Badge tone={account.status === 'active' ? 'completed' : 'clay'}>{account.status}</Badge></td>
                  <td className="px-4 py-4"><div className="flex justify-end gap-1">{account.status !== 'deleted' ? <><Button size="sm" variant="ghost" title="Set or reset unlock PIN" aria-label={`Set unlock PIN for ${account.fullName}`} onClick={() => { setPinTarget(account); setPin(''); }}><LockKeyhole className="h-4 w-4" /></Button><Button size="sm" variant="ghost" title="Generate temporary password" aria-label={`Reset password for ${account.fullName}`} onClick={() => void resetPassword(account)}><KeyRound className="h-4 w-4" /></Button>{['active', 'suspended'].includes(account.status) ? <Button size="sm" variant={account.status === 'active' ? 'warning' : 'secondary'} onClick={() => void toggleAccount(account)}>{account.status === 'active' ? <><UserRoundX className="h-4 w-4" /> Suspend</> : 'Restore'}</Button> : <span className="px-2 py-2 text-xs text-slate-500">{account.status.replaceAll('_', ' ')}</span>}{(actorRole === 'super_admin' || ['technical', 'trainee'].includes(account.role)) ? <Button size="sm" variant="ghost" title="Deactivate account and keep its records" aria-label={`Deactivate ${account.fullName}`} onClick={() => void deleteAccount(account)}><Trash2 className="h-4 w-4 text-clay-700" /></Button> : null}</> : <span className="text-xs text-slate-400">Deactivated</span>}</div></td>
                </tr>
              ))}
              {!filtered.length ? <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">No accounts match your search.</td></tr> : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
