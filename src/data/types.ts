import type {
  AddFundsInput,
  SavingsGoal,
  SavingsGoalInput,
  Transaction,
  TransactionInput,
} from "@/types/finance";

export type StorageNotice = "unavailable" | "recovered";

export interface FinanceData {
  transactions: Transaction[];
  goals: SavingsGoal[];
  notice: StorageNotice | null;
}

/**
 * Kontrak penyimpanan. Ada dua implementasi: browser (tamu) dan Supabase (akun).
 * Setiap method melempar FinanceError bila gagal.
 */
export interface FinanceRepository {
  load(): Promise<FinanceData>;
  addTransaction(input: TransactionInput): Promise<void>;
  updateTransaction(id: string, input: TransactionInput): Promise<void>;
  deleteTransaction(id: string): Promise<void>;
  addSavingsGoal(input: SavingsGoalInput): Promise<void>;
  updateSavingsGoal(id: string, input: SavingsGoalInput): Promise<void>;
  deleteSavingsGoal(id: string): Promise<void>;
  addFundsToGoal(goal: SavingsGoal, input: AddFundsInput): Promise<void>;
  importData?(transactions: readonly Transaction[], goals: readonly SavingsGoal[]): Promise<void>;
}