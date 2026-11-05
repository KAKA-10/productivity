import type { LucideIcon } from 'lucide-react';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
      <div className="rounded-2xl bg-forest-50 p-3 text-forest-700">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-bold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
