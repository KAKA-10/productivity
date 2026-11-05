'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { flushQueue, pendingCount } from '@/lib/offline';

export function OfflineBanner() {
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const sync = async () => {
      setOnline(navigator.onLine);
      setPending(await pendingCount());
    };
    const onOnline = async () => {
      setOnline(true);
      try {
        const n = await flushQueue();
        if (n) toast.success(`Synced ${n} offline change${n === 1 ? '' : 's'}`);
      } catch {
        toast.error('Some offline changes could not sync');
      }
      setPending(await pendingCount());
    };
    const onOffline = () => setOnline(false);
    void sync();
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  if (online && pending === 0) return null;

  return (
    <div className="flex items-center gap-2 bg-safety-100 px-4 py-2 text-xs font-semibold text-safety-700">
      <WifiOff className="h-3.5 w-3.5" />
      {online
        ? `${pending} change${pending === 1 ? '' : 's'} waiting to sync`
        : 'Offline — entries will queue and sync when you reconnect'}
    </div>
  );
}
