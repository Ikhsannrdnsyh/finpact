import type { ComponentProps, ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
  children: ReactNode;
}

const errorId = (id: string) => `${id}-error`;
const hintId = (id: string) => `${id}-hint`;

/** Props aksesibilitas untuk input: hubungkan ke pesan error/hint. */
export function fieldA11y(id: string, error?: string, hasHint = false) {
  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId(id) : hasHint ? hintId(id) : undefined,
  };
}

export function Field({ id, label, error, hint, optional, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
        {optional && <span className="ml-1 font-normal text-muted">(opsional)</span>}
      </label>
      {children}
      {error ? (
        <p id={errorId(id)} className="flex items-center gap-1.5 text-sm font-medium text-expense">
          <CircleAlert className="size-4 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p id={hintId(id)} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const CONTROL =
  "w-full rounded-xl border bg-surface px-3.5 py-2.5 text-base text-ink placeholder:text-slate-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25";

function controlClasses(invalid: unknown, className?: string): string {
  return cn(CONTROL, invalid ? "border-expense" : "border-border", className);
}

export function TextInput({ className, ...props }: ComponentProps<"input">) {
  return <input className={controlClasses(props["aria-invalid"], className)} {...props} />;
}

export function SelectInput({ className, ...props }: ComponentProps<"select">) {
  return <select className={controlClasses(props["aria-invalid"], className)} {...props} />;
}

export function TextArea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={controlClasses(props["aria-invalid"], cn("resize-y", className))} {...props} />;
}