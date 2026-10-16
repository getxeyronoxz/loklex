/* One unread pill for every surface: the visible number clamps at 99+
   so the pill stays narrow, while screen readers hear the real count.
   Positioning stays with the caller (absolute pills vs inline pills). */
export function CountBadge({
  value,
  label,
  className = "",
}: {
  value: number;
  label: string;
  className?: string;
}) {
  if (value <= 0) return null;
  return (
    <>
      <span
        aria-hidden
        className={`tnum rounded-full bg-accent px-1.5 py-px text-xs font-bold text-navy-950 ${className}`}
      >
        {value > 99 ? "99+" : value}
      </span>
      <span className="sr-only">
        {value} {label}
      </span>
    </>
  );
}
