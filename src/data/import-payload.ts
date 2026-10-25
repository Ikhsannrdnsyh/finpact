import type { SavingsGoal, Transaction } from "@/types/finance";

export interface GoalImportRow {
  id: string;
  title: string;
  target_amount: number;
  saved_amount: number;
  deadline: string | null;
  created_at: string;
}

export interface TransactionImportRow {
  id: string;
  type: Transaction["type"];
  title: string;
  amount: number;
  category: Transaction["category"];
  date: string;
  note: string | null;
  goal_id: string | null;
  created_at: string;
}

export interface ImportPayload {
  goals: GoalImportRow[];
  transactions: TransactionImportRow[];
}

/**
 * Menyiapkan data browser untuk dipindahkan ke akun.
 * - Semua data diberi id baru (UUID) agar tidak bentrok.
 * - Database menambah progres target otomatis untuk transaksi tabungan yang terhubung,
 *   jadi saved_amount awal dikurangi dulu supaya tidak terhitung dua kali.
 */
export function buildImportPayload(
  transactions: readonly Transaction[],
  goals: readonly SavingsGoal[],
  createUuid: () => string,
): ImportPayload {
  const goalEntries = goals.map((goal) => ({ goal, newId: createUuid() }));
  const goalIdMap = new Map(goalEntries.map(({ goal, newId }) => [goal.id, newId]));
  const linkedTotals = new Map<string, number>();

  const transactionRows = transactions.map((transaction): TransactionImportRow => {
    const goalId = transaction.goalId ? (goalIdMap.get(transaction.goalId) ?? null) : null;
    if (goalId && transaction.type === "expense") {
      linkedTotals.set(goalId, (linkedTotals.get(goalId) ?? 0) + transaction.amount);
    }
    return {
      id: createUuid(),
      type: transaction.type,
      title: transaction.title,
      amount: transaction.amount,
      category: transaction.category,
      date: transaction.date,
      note: transaction.note ?? null,
      goal_id: goalId,
      created_at: transaction.createdAt,
    };
  });

  const goalRows = goalEntries.map(
    ({ goal, newId }): GoalImportRow => ({
      id: newId,
      title: goal.title,
      target_amount: goal.targetAmount,
      saved_amount: Math.max(0, goal.savedAmount - (linkedTotals.get(newId) ?? 0)),
      deadline: goal.deadline ?? null,
      created_at: goal.createdAt,
    }),
  );

  return { goals: goalRows, transactions: transactionRows };
}