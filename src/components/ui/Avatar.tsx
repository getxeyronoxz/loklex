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
  tone?: "default" | "accent";
}) {
  return (
    <span
      aria-hidden
      /* Initials sometimes come from client-persisted state (the saved
         account), which the server can't know — the text converges
         after the restore effect, so never warn about the first pass. */
      suppressHydrationWarning
      className={`tnum flex shrink-0 items-center justify-center rounded-full border font-semibold ${
        sizes[size]
      } ${
        tone === "accent"
          ? "border-accent-deep/60 bg-accent-wash text-accent-hi"
          : "border-navy-700 bg-navy-800 text-ink-2"
      }`}
    >
      {initials}
    </span>
  );
}
