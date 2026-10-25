import { SelectInput } from "@/components/ui/FormField";
import { isOneOf } from "@/lib/guards";
import { PERIODS, type Period } from "@/types/finance";
import { PERIOD_LABELS } from "../constants";

interface PeriodSelectProps {
  id: string;
  value: Period;
  onChange: (period: Period) => void;
}

export function PeriodSelect({ id, value, onChange }: PeriodSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-sm font-medium text-muted">
        Periode
      </label>
      <SelectInput
        id={id}
        value={value}
        className="w-auto py-2"
        onChange={(event) => {
          if (isOneOf(PERIODS, event.target.value)) onChange(event.target.value);
        }}
      >
        {PERIODS.map((period) => (
          <option key={period} value={period}>
            {PERIOD_LABELS[period]}
          </option>
        ))}
      </SelectInput>
    </div>
  );
}