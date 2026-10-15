export function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-navy-700 bg-navy-900 ${className}`}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-3 border-b border-navy-700 px-5 pb-4 pt-5">
      <div>
        <p className="eyebrow text-gold">{eyebrow}</p>
        <h2 className="mt-1 font-display text-[22px] font-light leading-snug text-ink">
          {title}
        </h2>
      </div>
      {action}
    </header>
  );
}
