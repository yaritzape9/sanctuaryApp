type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-white/10 ${className ?? ""}`}
    />
  );
}

// Pre-built skeleton layouts for pages you'll need soon
export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5 space-y-3">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonMap() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-[400px] w-full rounded-2xl" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    </div>
  );
}