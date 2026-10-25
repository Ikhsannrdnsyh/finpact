import type { SupabaseClient } from "@supabase/supabase-js";
import { isSavingsGoal } from "@/features/savings/validation";
import { GOAL_TRANSFER_NOTE, goalTransferTitle } from "@/features/savings/transfer";
import { isTransaction } from "@/features/transactions/validation";
import { isRecord } from "@/lib/guards";
import type { SavingsGoal, SavingsGoalInput, Transaction, TransactionInput } from "@/types/finance";
import { fromSupabaseError, notFoundError } from "./errors";
import { buildImportPayload } from "./import-payload";
import type { FinanceRepository } from "./types";

const TRANSACTION_COLUMNS = "id, type, title, amount, category, date, note, goal_id, created_at, updated_at";
const GOAL_COLUMNS = "id, title, target_amount, saved_amount, deadline, created_at, updated_at";

// ---------- Konversi baris database (snake_case) <-> model aplikasi (camelCase) ----------

function rowToTransaction(row: unknown): Transaction | null {
  if (!isRecord(row)) return null;
  const candidate = {
    id: row.id,
    type: row.type,
    title: row.title,
    amount: row.amount,
    category: row.category,
    date: row.date,
    note: row.note ?? undefined,
    goalId: row.goal_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  return isTransaction(candidate) ? candidate : null;
}

function rowToGoal(row: unknown): SavingsGoal | null {
  if (!isRecord(row)) return null;
  const candidate = {
    id: row.id,
    title: row.title,
    targetAmount: row.target_amount,
    savedAmount: row.saved_amount,
    deadline: row.deadline ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  return isSavingsGoal(candidate) ? candidate : null;
}

function mapRows<T>(rows: unknown, mapper: (row: unknown) => T | null): T[] {
  if (!Array.isArray(rows)) return [];
  return rows.map(mapper).filter((item): item is T => item !== null);
}

function transactionToRow(input: TransactionInput) {
  return {
    type: input.type,
    title: input.title,
    amount: input.amount,
    category: input.category,
    date: input.date,
    note: input.note ?? null,
  };
}

function goalToRow(input: SavingsGoalInput) {
  return {
    title: input.title,
    target_amount: input.targetAmount,
    saved_amount: input.savedAmount,
    deadline: input.deadline ?? null,
  };
}

// ---------- Repository ----------

/** user_id diisi otomatis oleh database (auth.uid()); RLS menjamin tiap siswa hanya menyentuh datanya. */
export function createSupabaseRepository(supabase: SupabaseClient): FinanceRepository {
  async function insertRow(table: string, values: Record<string, unknown>) {
    const { error } = await supabase.from(table).insert(values);
    if (error) throw fromSupabaseError(error);
  }

  async function updateRow(table: string, id: string, values: Record<string, unknown>, label: string) {
    const { data, error } = await supabase.from(table).update(values).eq("id", id).select("id");
    if (error) throw fromSupabaseError(error);
    if (!data || data.length === 0) throw notFoundError(label);
  }

  async function deleteRow(table: string, id: string, label: string) {
    const { data, error } = await supabase.from(table).delete().eq("id", id).select("id");
    if (error) throw fromSupabaseError(error);
    if (!data || data.length === 0) throw notFoundError(label);
  }

  return {
    async load() {
      const [transactions, goals] = await Promise.all([
        supabase.from("transactions").select(TRANSACTION_COLUMNS),
        supabase.from("savings_goals").select(GOAL_COLUMNS),
      ]);
      if (transactions.error) throw fromSupabaseError(transactions.error);
      if (goals.error) throw fromSupabaseError(goals.error);
      return {
        transactions: mapRows(transactions.data, rowToTransaction),
        goals: mapRows(goals.data, rowToGoal),
        notice: null,
      };
    },

    addTransaction: (input) => insertRow("transactions", transactionToRow(input)),
    updateTransaction: (id, input) => updateRow("transactions", id, transactionToRow(input), "Transaksi"),
    deleteTransaction: (id) => deleteRow("transactions", id, "Transaksi"),

    addSavingsGoal: (input) => insertRow("savings_goals", goalToRow(input)),
    updateSavingsGoal: (id, input) => updateRow("savings_goals", id, goalToRow(input), "Target"),
    deleteSavingsGoal: (id) => deleteRow("savings_goals", id, "Target"),

    // Cukup satu insert: trigger database menambah progres target dalam transaksi yang sama.
    addFundsToGoal: (goal, { amount, date }) =>
      insertRow("transactions", {
        type: "expense",
        title: goalTransferTitle(goal.title),
        amount,
        category: "savings",
        date,
        note: GOAL_TRANSFER_NOTE,
        goal_id: goal.id,
      }),

    async importData(transactions, goals) {
      const payload = buildImportPayload(transactions, goals, () => crypto.randomUUID());
      const { error } = await supabase.rpc("import_local_data", {
        p_goals: payload.goals,
        p_transactions: payload.transactions,
      });
      if (error) throw fromSupabaseError(error);
    },
  };
}