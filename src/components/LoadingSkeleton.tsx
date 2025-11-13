export function LoadingSkeleton() {
  return (
    <div className="animate-pulse p-4 space-y-4">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-6 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <div className="h-3 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-3/4" />
        </div>
        <div className="space-y-1">
          <div className="h-3 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-3/4" />
        </div>
        <div className="space-y-1">
          <div className="h-3 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-3/4" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="space-y-2 pt-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex justify-between items-center py-2">
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="h-4 bg-slate-200 rounded w-1/6" />
            <div className="h-4 bg-slate-200 rounded w-1/4" />
          </div>
        ))}
      </div>
    </div>
  )
}
