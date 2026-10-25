import type { SavingsGoal, Transaction } from "@/types/finance";

export interface GoalProgress {
  percent: number; // 0–100, dibulatkan ke bawah
  remaining: number;
  isComplete: boolean;
}

export function calculateGoalProgress(
  goal: Pick<SavingsGoal, "targetAmount" | "savedAmount">,
): GoalProgress {
  if (goal.targetAmount <= 0) return { percent: 0, remaining: 0, isComplete: false };
  return {
    percent: Math.min(100, Math.floor((goal.savedAmount / goal.targetAmount) * 100)),
    remaining: Math.max(0, goal.targetAmount - goal.savedAmount),
    isComplete: goal.savedAmount >= goal.targetAmount,
  };
}

export function summarizeGoals(goals: readonly SavingsGoal[]) {
  return goals.reduce(
    (summary, goal) => ({
      totalTarget: summary.totalTarget + goal.targetAmount,
      totalSaved: summary.totalSaved + goal.savedAmount,
      completed: summary.completed + (calculateGoalProgress(goal).isComplete ? 1 : 0),
    }),
    { totalTarget: 0, totalSaved: 0, completed: 0 },
  );
}

export function isDeadlinePassed(goal: SavingsGoal, today: string): boolean {
  return Boolean(goal.deadline && goal.deadline < today && !calculateGoalProgress(goal).isComplete);
}

/** Yang belum tercapai di atas, lalu yang terbaru dibuat. */
export function sortGoals(goals: readonly SavingsGoal[]): SavingsGoal[] {
  return [...goals].sort((a, b) => {
    const completeDiff =
      Number(calculateGoalProgress(a).isComplete) - Number(calculateGoalProgress(b).isComplete);
    return completeDiff || b.createdAt.localeCompare(a.createdAt);
  });
}

/** Berapa rupiah yang disumbangkan sebuah transaksi ke progres target. */
export function getGoalContribution(transaction: Pick<Transaction, "goalId" | "type" | "amount">): number {
  return transaction.goalId && transaction.type === "expense" ? transaction.amount : 0;
}