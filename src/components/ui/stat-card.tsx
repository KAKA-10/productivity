'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'forest',
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: 'forest' | 'clay' | 'safety' | 'slate';
}) {
  const tones = {
    forest: 'bg-forest-50 text-forest-700',
    clay: 'bg-clay-50 text-clay',
    safety: 'bg-safety-50 text-safety-700',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-ink">{value}</p>
        </div>
        <div className={cn('rounded-xl p-2.5', tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {hint ? <p className="mt-3 text-xs font-medium text-slate-500">{hint}</p> : null}
    </motion.div>
  );
}
