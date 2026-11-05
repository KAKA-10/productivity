import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-xl', className)} />;
}

export function StatSkeleton() {
  return (
    <div className="rounded-2xl border border-white/80 bg-white p-5 shadow-sm">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-8 w-16" />
      <Skeleton className="mt-3 h-3 w-32" />
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-4">
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="mt-3 h-6 w-3/4" />
          <Skeleton className="mt-4 h-16 w-full" />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <span className="pulse-ring absolute inset-0 rounded-full bg-forest-400/30" />
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-forest-100 border-t-forest-600" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest-700">
        Loading TODOMU
      </p>
    </div>
  );
}
