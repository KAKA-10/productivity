import { enqueue } from './offline';

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(path, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Request failed');
    }
    return data as T;
  } catch (err) {
    const method = (init?.method || 'GET').toUpperCase();
    if (typeof navigator !== 'undefined' && !navigator.onLine && method !== 'GET') {
      const resource = path.split('/')[3] || 'data';
      await enqueue({
        resource,
        method: method as 'POST' | 'PATCH' | 'DELETE',
        path,
        body: init?.body ? JSON.parse(String(init.body)) : undefined,
      });
      return {
        id: `offline-${Date.now()}`,
        offline: true,
        ...(init?.body ? JSON.parse(String(init.body)) : {}),
      } as T;
    }
    throw err;
  }
}
