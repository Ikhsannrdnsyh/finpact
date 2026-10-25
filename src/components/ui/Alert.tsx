import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

export type Feedback = { kind: "success" | "error" | "info"; message: string };

const STYLES: Record<Feedback["kind"], string> = {
  success: "border-income/30 bg-income-light text-income",
  error: "border-expense/30 bg-expense-light text-expense",
  info: "border-border bg-primary-light text-primary-dark",
};

const ICONS = { success: CircleCheck, error: CircleAlert, info: Info } as const;

export function Alert({ feedback, onDismiss }: { feedback: Feedback; onDismiss?: () => void }) {
  const Icon = ICONS[feedback.kind];
  return (
    <div
      role={feedback.kind === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-3 rounded-xl border px-4 py-3", STYLES[feedback.kind])}
    >
      <Icon className="mt-0.5 size-5 shrink-0" />
      <p className="flex-1 text-sm font-medium">{feedback.message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Tutup pesan"
          className="-m-1 rounded-lg p-1 opacity-70 hover:opacity-100"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}