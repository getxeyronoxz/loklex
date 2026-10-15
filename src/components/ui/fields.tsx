import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-[13px] font-semibold text-ink"
        >
          {label}
        </label>
      )}
      <div className={label ? "mt-1.5" : ""}>{children}</div>
      {hint && !error && <p className="mt-1.5 text-[13px] text-ink-3">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1.5 text-[13px] font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

const control =
  "w-full rounded-lg border bg-navy-950 px-3 py-2.5 text-[15px] text-ink placeholder:text-ink-3 transition-colors duration-150 focus:border-gold focus:outline-none aria-[invalid=true]:border-danger";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${control} ${props.className ?? ""}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${control} min-h-[120px] resize-y ${props.className ?? ""}`}
    />
  );
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${control} ${props.className ?? ""}`} />;
}
