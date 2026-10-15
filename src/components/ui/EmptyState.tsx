import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div role="status" className="flex flex-col items-center px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-navy-700 bg-navy-850">
        <Icon className="h-5 w-5 text-gold/60" strokeWidth={1.5} aria-hidden />
      </span>
      <h3 className="mt-4 font-display text-lg font-normal text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-2">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading" className="space-y-3 px-5 py-5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-3/5 animate-pulse rounded bg-navy-700/60" />
          <div className="h-3 w-2/5 animate-pulse rounded bg-navy-800" />
        </div>
      ))}
    </div>
  );
}
