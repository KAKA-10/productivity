'use client';

import { motion } from 'framer-motion';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        {eyebrow ? (
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-forest-600">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </motion.div>
  );
}
