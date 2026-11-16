'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

export function useCollection<T extends { id: string }>(resource: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const started = Date.now();
    try {
      const data = await api<T[]>(`/api/data/${resource}`);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      const wait = Math.max(0, 450 - (Date.now() - started));
      await new Promise((r) => setTimeout(r, wait));
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = async (payload: Record<string, unknown>) => {
    const created = await api<T>(`/api/data/${resource}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setItems((prev) => [created, ...prev]);
    return created;
  };

  const update = async (id: string, payload: Record<string, unknown>) => {
    const updated = await api<T>(`/api/data/${resource}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    return updated;
  };

  const remove = async (id: string) => {
    await api(`/api/data/${resource}/${id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return { items, loading, error, refresh, create, update, remove, setItems };
}
