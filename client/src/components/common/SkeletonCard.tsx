export default function SkeletonCard() {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/30 overflow-hidden animate-pulse">
      <div className="w-full aspect-[2/3] bg-slate-700/50" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-slate-700/50 rounded w-3/4" />
        <div className="h-3 bg-slate-700/30 rounded w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonStatsCard() {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/30 p-5 animate-pulse">
      <div className="h-8 w-8 bg-slate-700/50 rounded mb-3" />
      <div className="h-8 bg-slate-700/50 rounded w-16 mb-2" />
      <div className="h-3 bg-slate-700/30 rounded w-20" />
    </div>
  );
}
