export function activeWorkspaceHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const branchId = window.localStorage.getItem('todomu_active_branch');
  return branchId ? { 'x-todomu-branch': branchId } : {};
}

export async function strictApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...activeWorkspaceHeaders(),
      ...(init?.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}
