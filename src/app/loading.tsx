import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div
      className="space-y-6 animate-pulse select-none"
      aria-busy="true"
      aria-label="Carregando página..."
    >
      {/* Header Skeleton */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44 rounded-xl" />
          <Skeleton className="h-4 w-64 rounded-lg opacity-70" />
        </div>
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>

      {/* Main Content Box Skeleton */}
      <div className="p-5 rounded-2xl bg-card border border-border/80 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="space-y-3 pt-2">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
