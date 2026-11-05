'use client';

import { Toaster } from 'sonner';
import { PwaRegister } from '@/components/pwa-register';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PwaRegister />
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast:
              'rounded-2xl border border-slate-200 bg-white shadow-xl font-[family-name:var(--font-ibm-plex-sans)]',
            title: 'font-semibold text-ink',
            description: 'text-slate-500',
          },
        }}
      />
    </>
  );
}
