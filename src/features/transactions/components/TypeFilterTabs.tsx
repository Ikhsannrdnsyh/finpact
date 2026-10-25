import { cn } from "@/lib/cn";
import type { TypeFilter } from "@/types/finance";
import { TYPE_FILTER_OPTIONS } from "../constants";

export function TypeFilterTabs({ value, onChange }: { value: TypeFilter; onChange: (value: TypeFilter) => void }) {
  return (
    <div role="group" aria-label="Filter jenis transaksi" className="inline-flex rounded-xl bg-primary-light p-1">
      {TYPE_FILTER_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "min-h-9 rounded-lg px-3 text-sm font-semibold transition-colors",
            value === option.value ? "bg-surface text-primary shadow-sm" : "text-muted hover:text-ink",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}