import { cn } from "@/lib/cn";

interface ProgressBarProps {
  value: number;
  label: string;
  tone?: "primary" | "success";
}

export function ProgressBar({ value, label, tone = "primary" }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className="h-2.5 w-full overflow-hidden rounded-full bg-primary-light"
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-500",
          tone === "success" ? "bg-income" : "bg-primary",
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}