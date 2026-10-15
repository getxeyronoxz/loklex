const sizes = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-[13px]",
  lg: "h-12 w-12 text-sm",
};

export function Avatar({
  initials,
  size = "md",
  tone = "default",
}: {
  initials: string;
  size?: keyof typeof sizes;
  tone?: "default" | "gold";
}) {
  return (
    <span
      aria-hidden
      className={`tnum flex shrink-0 items-center justify-center rounded-full border font-semibold ${
        sizes[size]
      } ${
        tone === "gold"
          ? "border-gold-deep/60 bg-gold-wash text-gold-hi"
          : "border-navy-700 bg-navy-800 text-ink-2"
      }`}
    >
      {initials}
    </span>
  );
}
