"use client";

/** Plain layout — avoids Framer Motion + webpack chunk issues during dev (opacity:0 SSR, stale bundles). */

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-200 ${className}`}
      aria-hidden="true"
    />
  );
}

export function ReportSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-12">
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
        <div className="mt-6 flex items-center gap-4">
          <Skeleton className="h-12 w-16 rounded-lg" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <Skeleton className="h-5 w-[75%]" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-2/3" />
              </div>
              <Skeleton className="h-8 w-12 shrink-0 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScanFormSkeleton() {
  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-16">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-5 w-96" />
      <div className="space-y-6 pt-8">
        <div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-2 h-12 w-full rounded-lg" />
        </div>
        <div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-2 h-12 w-full rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="mt-2 h-12 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-4 w-12" />
            <Skeleton className="mt-2 h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
