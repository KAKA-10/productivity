'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    sync();
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-6 text-center text-white">
      <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <WifiOff className="mx-auto h-10 w-10 text-safety-300" />
        <h1 className="mt-5 text-xl font-bold">Internet connection required</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Productivity OSHAPP is online-only. Reconnect to continue; unsaved changes are not queued offline.
        </p>
      </div>
    </div>
  );
}
