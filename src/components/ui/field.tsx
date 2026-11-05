import { cn } from '@/lib/utils';

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('block space-y-1.5', className)}>
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('field', props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn('field', props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn('field min-h-28 resize-y', props.className)} />;
}

export function ChoiceCards<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; hint?: string; className?: string }[];
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-2xl border px-3 py-3 text-left transition',
              active
                ? 'border-forest-500 bg-forest-50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-forest-200',
              option.className,
            )}
          >
            <p className="text-sm font-bold text-ink">{option.label}</p>
            {option.hint ? (
              <p className="mt-0.5 text-[11px] text-slate-500">{option.hint}</p>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
