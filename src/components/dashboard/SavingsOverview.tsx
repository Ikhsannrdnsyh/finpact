import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { calculateGoalProgress, sortGoals } from "@/features/savings/calculations";
import { formatRupiah } from "@/lib/money";
import type { SavingsGoal } from "@/types/finance";

const PREVIEW_LIMIT = 3;

export function SavingsOverview({ goals }: { goals: readonly SavingsGoal[] }) {
  const preview = sortGoals(goals).slice(0, PREVIEW_LIMIT);

  return (
    <Card>
      <CardHeader
        title="Target Tabungan"
        action={
          <Link href="/tabungan" className="text-sm font-semibold text-primary hover:underline">
            Kelola
          </Link>
        }
      />
      {preview.length === 0 ? (
        <p className="text-sm text-muted">
          Belum ada target.{" "}
          <Link href="/tabungan#tambah-target" className="font-semibold text-primary hover:underline">
            Buat target pertamamu
          </Link>
        </p>
      ) : (
        <ul className="space-y-4">
          {preview.map((goal) => {
            const progress = calculateGoalProgress(goal);
            return (
              <li key={goal.id}>
                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                  <p className="truncate font-semibold">{goal.title}</p>
                  <span className="text-sm font-bold">{progress.percent}%</span>
                </div>
                <ProgressBar
                  value={progress.percent}
                  label={`Progress ${goal.title}`}
                  tone={progress.isComplete ? "success" : "primary"}
                />
                <p className="mt-1 text-xs text-muted">
                  {formatRupiah(goal.savedAmount)} / {formatRupiah(goal.targetAmount)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}