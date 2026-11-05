'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

type Reminder = {
  id: string;
  title: string;
  dueDate: string;
  source: string;
  sourceRef: string;
  body: string;
};

export function ReminderBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Reminder[]>([]);
  const [sending, setSending] = useState(false);

  const load = async () => {
    const res = await fetch('/api/reminders');
    if (!res.ok) return;
    const data = await res.json();
    setItems(data.items || []);
  };

  useEffect(() => {
    void load();
  }, []);

  const dispatch = async () => {
    setSending(true);
    try {
      const res = await fetch('/api/reminders', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success(`${data.sent} reminder${data.sent === 1 ? '' : 's'} logged (${data.mode})`);
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100"
        aria-label="Compliance reminders"
      >
        <Bell className="h-4 w-4" />
        {items.length ? (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-clay" />
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
          <p className="px-1 text-xs font-bold uppercase tracking-wider text-slate-400">
            Due in 30 days
          </p>
          <div className="mt-2 max-h-72 space-y-2 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-1 py-6 text-center text-sm text-slate-500">No upcoming reminders.</p>
            ) : (
              items.slice(0, 8).map((item) => (
                <div key={item.id} className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="font-mono text-[10px] text-slate-400">
                    {item.sourceRef} · {formatDate(item.dueDate)}
                  </p>
                </div>
              ))
            )}
          </div>
          <Button className="mt-3 w-full" size="sm" onClick={() => void dispatch()} disabled={!items.length || sending}>
            {sending ? 'Sending…' : 'Send reminder emails'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
