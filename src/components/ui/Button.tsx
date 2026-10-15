import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "subtle" | "danger";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary:
    "btn-sheen bg-gold text-navy-950 font-semibold hover:bg-gold-hi active:bg-gold-deep active:scale-[0.98] disabled:bg-navy-700 disabled:text-ink-3",
  ghost:
    "text-ink-2 hover:text-ink hover:bg-navy-800 active:bg-navy-700 disabled:text-ink-3 disabled:bg-transparent",
  subtle:
    "border border-navy-700 text-ink-2 hover:text-ink hover:border-navy-600 hover:bg-navy-800 disabled:text-ink-3 disabled:border-navy-700 disabled:bg-transparent",
  danger:
    "text-danger hover:bg-danger/10 active:bg-danger/15 disabled:text-ink-3 disabled:bg-transparent",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-[13px] rounded-lg gap-1.5",
  md: "h-10 px-4 text-sm rounded-lg gap-2",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-[40px] items-center justify-center font-medium transition-colors duration-150 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    />
  );
}
