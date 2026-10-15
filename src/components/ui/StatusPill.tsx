const tones: Record<string, { pill: string; dot: string }> = {
  neutral: { pill: "bg-navy-800 text-ink-2", dot: "bg-ink-3" },
  info: { pill: "bg-gold-wash text-gold-hi", dot: "bg-gold" },
  warn: { pill: "bg-warn/15 text-warn", dot: "bg-warn" },
  success: { pill: "bg-success/15 text-success", dot: "bg-success" },
  muted: { pill: "border border-navy-700 text-ink-3", dot: "bg-navy-600" },
};

export function StatusPill({
  tone = "neutral",
  children,
}: {
  tone?: keyof typeof tones;
  children: React.ReactNode;
}) {
  const t = tones[tone];
  return (
    <span
      className={`tnum inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold tracking-wide ${t.pill}`}
    >
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
      {children}
    </span>
  );
}
