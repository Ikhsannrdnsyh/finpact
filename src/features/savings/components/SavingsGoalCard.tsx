import { CalendarDays, CirclePlus, Pencil, Target, Trash2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";
import type { SavingsGoal } from "@/types/finance";
import { calculateGoalProgress, isDeadlinePassed } from "../calculations";

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  today: string;
  onAddFunds: (goal: SavingsGoal) => void;
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (goal: SavingsGoal) => void;
}

export function SavingsGoalCard({ goal, today, onAddFunds, onEdit, onDelete }: SavingsGoalCardProps) {
  const progress = calculateGoalProgress(goal);
  const overdue = isDeadlinePassed(goal, today);

  return (
    <Card className="flex h-full flex-col gap-4">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            progress.isComplete ? "bg-income-light text-income" : "bg-primary-light text-primary",
          )}
        >
          {progress.isComplete ? <Trophy className="size-5" /> : <Target className="size-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold">{goal.title}</h3>
          <p className="text-sm text-muted">
            {formatRupiah(goal.savedAmount)} dari {formatRupiah(goal.targetAmount)}
          </p>
        </div>
        <div className="-mr-2 -mt-2 flex shrink-0">
          <Button variant="ghost" size="icon" onClick={() => onEdit(goal)} aria-label={`Edit target ${goal.title}`}>
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(goal)}
            aria-label={`Hapus target ${goal.title}`}
            className="hover:bg-expense-light hover:text-expense"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
          <span className="font-bold">{progress.percent}%</span>
          <span className={progress.isComplete ? "font-semibold text-income" : "text-muted"}>
            {progress.isComplete ? "Target tercapai! 🎉" : `Kurang ${formatRupiah(progress.remaining)} lagi`}
          </span>
        </div>
        <ProgressBar
          value={progress.percent}
          label={`Progress ${goal.title}`}
          tone={progress.isComplete ? "success" : "primary"}
        />
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
        {goal.deadline ? (
          <p className={cn("flex items-center gap-1.5 text-sm", overdue ? "text-warning" : "text-muted")}>
            <CalendarDays className="size-4 shrink-0" />
            Tenggat {formatDate(goal.deadline)}
            {overdue && " · sudah lewat"}
          </p>
        ) : (
          <span />
        )}
        <Button
          size="sm"
          variant={progress.isComplete ? "secondary" : "primary"}
          onClick={() => onAddFunds(goal)}
          aria-label={`Tambah dana ke ${goal.title}`}
        >
          <CirclePlus className="size-4" />
          Tambah Dana
        </Button>
      </div>
    </Card>
  );
}