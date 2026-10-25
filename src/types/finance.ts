export const TRANSACTION_TYPES = ["income", "expense"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_CATEGORIES = [
  "allowance",
  "food",
  "transport",
  "school",
  "entertainment",
  "savings",
  "other",
] as const;
export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

export const PERIODS = ["this-month", "last-7-days", "last-month", "all"] as const;
export type Period = (typeof PERIODS)[number];

export type TypeFilter = "all" | TransactionType;

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  category: TransactionCategory;
  date: string;
  note?: string;
  goalId?: string; // terisi bila transaksi berasal dari "Tambah Dana" ke target tabungan
  createdAt: string;
  updatedAt: string;
}

export type TransactionInput = Omit<Transaction, "id" | "createdAt" | "updatedAt">;

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  deadline?: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export type SavingsGoalInput = Omit<SavingsGoal, "id" | "createdAt" | "updatedAt">;

export interface AddFundsInput {
  amount: number;
  date: string;
}

export type ValidationResult<T, Field extends string> =
  | { ok: true; value: T }
  | { ok: false; errors: Partial<Record<Field, string>> };

export type ActionResult = { ok: true } | { ok: false; message: string };