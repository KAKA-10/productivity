import { cn } from '@/lib/utils';

const TONES: Record<string, string> = {
  forest: 'bg-forest-50 text-forest-700 border-forest-200',
  clay: 'bg-clay-50 text-clay-700 border-clay-100',
  safety: 'bg-safety-50 text-safety-700 border-safety-100',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
};

export function Badge({
  children,
  tone = 'slate',
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof TONES | string;
  className?: string;
}) {
  const mapped =
    tone === 'High' || tone === 'urgent' || tone === 'Open'
      ? 'clay'
      : tone === 'Medium' || tone === 'pending' || tone === 'In Progress'
        ? 'safety'
        : tone === 'Low' || tone === 'completed' || tone === 'Resolved' || tone === 'Approved' || tone === 'Closed'
          ? 'forest'
          : tone;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
        TONES[mapped] || TONES.slate,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function severityTone(value: string) {
  if (value === 'High') return 'clay';
  if (value === 'Medium') return 'safety';
  return 'forest';
}
