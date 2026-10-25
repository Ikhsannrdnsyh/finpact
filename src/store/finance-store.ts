import { getGoalContribution } from "@/features/savings/calculations";
import { loadSavingsGoals, saveSavingsGoals } from "@/features/savings/storage";
import { TITLE_MAX_LENGTH } from "@/features/transactions/constants";
import { loadTransactions, saveTransactions } from "@/features/transactions/storage";
import { createId } from "@/lib/id";
import { MAX_AMOUNT } from "@/lib/money";
import type { ReadStatus } from "@/lib/storage/local-storage";
import type {
  ActionResult,
  AddFundsInput,
  SavingsGoal,
  SavingsGoalInput,
  Transaction,
  TransactionInput,
} from "@/types/finance";

/**
 * Store kecil berbasis useSyncExternalStore.
 * Server & hydration selalu melihat status "loading"; data localStorage
 * dibaca saat pertama kali diakses di browser. Ganti fungsi load/save di
 * sini bila kelak memakai backend — komponen UI tidak perlu ditulis ulang.
 */
export type StorageNotice = "unavailable" | "recovered";

export interface FinanceSnapshot {
  status: "loading" | "ready";
  transactions: readonly Transaction[];
  goals: readonly SavingsGoal[];
  notice: StorageNotice | null;
}

const LOADING_SNAPSHOT: FinanceSnapshot = {
  status: "loading",
  transactions: [],
  goals: [],
  notice: null,
};

const SAVE_FAILED: ActionResult = {
  ok: false,
  message:
    "Data gagal disimpan. Penyimpanan browser mungkin penuh, diblokir, atau sedang dalam mode privat.",
};

let snapshot: FinanceSnapshot = LOADING_SNAPSHOT;
let initialized = false;
const listeners = new Set<() => void>();

function resolveNotice(statuses: ReadStatus[]): StorageNotice | null {
  if (statuses.includes("unavailable")) return "unavailable";
  if (statuses.includes("recovered")) return "recovered";
  return null;
}

function initialize(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  const transactions = loadTransactions();
  const goals = loadSavingsGoals();
  snapshot = {
    status: "ready",
    transactions: transactions.items,
    goals: goals.items,
    notice: resolveNotice([transactions.status, goals.status]),
  };
}

function setSnapshot(patch: Partial<FinanceSnapshot>): void {
  snapshot = { ...snapshot, ...patch };
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): FinanceSnapshot {
  initialize();
  return snapshot;
}

export function getServerSnapshot(): FinanceSnapshot {
  return LOADING_SNAPSHOT;
}

function notFound(label: string): ActionResult {
  return { ok: false, message: `${label} tidak ditemukan. Mungkin sudah dihapus.` };
}

function timestamp(): string {
  return new Date().toISOString();
}

// ---------- Commit (persist lalu update state) ----------

function commitTransactions(next: Transaction[]): ActionResult {
  if (!saveTransactions(next)) return SAVE_FAILED;
  setSnapshot({ transactions: next });
  return { ok: true };
}

function commitGoals(next: SavingsGoal[]): ActionResult {
  if (!saveSavingsGoals(next)) return SAVE_FAILED;
  setSnapshot({ goals: next });
  return { ok: true };
}

/** Menyimpan transaksi & target bersamaan; bila target gagal, transaksi dikembalikan. */
function commitAll(nextTransactions: Transaction[], nextGoals: SavingsGoal[]): ActionResult {
  const previousTransactions = snapshot.transactions;
  if (!saveTransactions(nextTransactions)) return SAVE_FAILED;
  if (!saveSavingsGoals(nextGoals)) {
    saveTransactions(previousTransactions);
    return SAVE_FAILED;
  }
  setSnapshot({ transactions: nextTransactions, goals: nextGoals });
  return { ok: true };
}

function adjustGoalSaved(goalId: string, delta: number, now: string): SavingsGoal[] {
  return snapshot.goals.map((goal) =>
    goal.id === goalId
      ? { ...goal, savedAmount: Math.min(MAX_AMOUNT, Math.max(0, goal.savedAmount + delta)), updatedAt: now }
      : goal,
  );
}

/** Simpan transaksi; bila transaksi terhubung ke target yang masih ada, sesuaikan progresnya. */
function commitWithGoalDelta(
  nextTransactions: Transaction[],
  goalId: string | undefined,
  delta: number,
  now: string,
): ActionResult {
  if (!goalId || delta === 0 || !snapshot.goals.some((goal) => goal.id === goalId)) {
    return commitTransactions(nextTransactions);
  }
  return commitAll(nextTransactions, adjustGoalSaved(goalId, delta, now));
}

// ---------- Transaksi ----------

export function addTransaction(input: TransactionInput): ActionResult {
  initialize();
  const now = timestamp();
  return commitTransactions([
    { ...input, id: createId(), createdAt: now, updatedAt: now },
    ...snapshot.transactions,
  ]);
}

export function updateTransaction(id: string, input: TransactionInput): ActionResult {
  initialize();
  const existing = snapshot.transactions.find((item) => item.id === id);
  if (!existing) return notFound("Transaksi");

  const now = timestamp();
  const updated: Transaction = { ...existing, ...input, updatedAt: now };
  const next = snapshot.transactions.map((item) => (item.id === id ? updated : item));
  const delta = getGoalContribution(updated) - getGoalContribution(existing);
  return commitWithGoalDelta(next, existing.goalId, delta, now);
}

export function deleteTransaction(id: string): ActionResult {
  initialize();
  const existing = snapshot.transactions.find((item) => item.id === id);
  if (!existing) return notFound("Transaksi");

  const next = snapshot.transactions.filter((item) => item.id !== id);
  return commitWithGoalDelta(next, existing.goalId, -getGoalContribution(existing), timestamp());
}

// ---------- Target tabungan ----------

export function addSavingsGoal(input: SavingsGoalInput): ActionResult {
  initialize();
  const now = timestamp();
  return commitGoals([{ ...input, id: createId(), createdAt: now, updatedAt: now }, ...snapshot.goals]);
}

export function updateSavingsGoal(id: string, input: SavingsGoalInput): ActionResult {
  initialize();
  if (!snapshot.goals.some((goal) => goal.id === id)) return notFound("Target");
  const now = timestamp();
  return commitGoals(snapshot.goals.map((goal) => (goal.id === id ? { ...goal, ...input, updatedAt: now } : goal)));
}

/** Transaksi lama yang terhubung tetap ada di riwayat (uangnya memang sudah disisihkan). */
export function deleteSavingsGoal(id: string): ActionResult {
  initialize();
  const next = snapshot.goals.filter((goal) => goal.id !== id);
  if (next.length === snapshot.goals.length) return notFound("Target");
  return commitGoals(next);
}

/** Menambah progres target sekaligus mencatat Uang Keluar kategori Tabungan. */
export function addFundsToGoal(goalId: string, { amount, date }: AddFundsInput): ActionResult {
  initialize();
  const goal = snapshot.goals.find((item) => item.id === goalId);
  if (!goal) return notFound("Target");
  if (goal.savedAmount + amount > MAX_AMOUNT) return { ok: false, message: "Nominal terlalu besar." };

  const now = timestamp();
  const transaction: Transaction = {
    id: createId(),
    type: "expense",
    title: `Tabungan: ${goal.title}`.slice(0, TITLE_MAX_LENGTH),
    amount,
    category: "savings",
    date,
    note: "Dana disisihkan ke target tabungan.",
    goalId,
    createdAt: now,
    updatedAt: now,
  };
  return commitAll([transaction, ...snapshot.transactions], adjustGoalSaved(goalId, amount, now));
}

export function dismissStorageNotice(): void {
  setSnapshot({ notice: null });
}