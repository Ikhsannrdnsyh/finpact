import { getGoalContribution } from "@/features/savings/calculations";
import { SAVINGS_STORAGE_KEY, loadSavingsGoals, saveSavingsGoals } from "@/features/savings/storage";
import { GOAL_TRANSFER_NOTE, goalTransferTitle } from "@/features/savings/transfer";
import { TRANSACTIONS_STORAGE_KEY, loadTransactions, saveTransactions } from "@/features/transactions/storage";
import { createId } from "@/lib/id";
import { MAX_AMOUNT } from "@/lib/money";
import { removeKey, type ReadStatus } from "@/lib/storage/local-storage";
import type { SavingsGoal, Transaction } from "@/types/finance";
import { FinanceError, notFoundError } from "./errors";
import type { FinanceRepository, StorageNotice } from "./types";

const SAVE_FAILED_MESSAGE =
  "Data gagal disimpan. Penyimpanan browser mungkin penuh, diblokir, atau sedang dalam mode privat.";

export interface LocalRepository extends FinanceRepository {
  /** Menghapus semua data FinPact dari browser ini. */
  clear(): void;
}

function resolveNotice(statuses: ReadStatus[]): StorageNotice | null {
  if (statuses.includes("unavailable")) return "unavailable";
  if (statuses.includes("recovered")) return "recovered";
  return null;
}

function timestamp(): string {
  return new Date().toISOString();
}

function readAll() {
  return { transactions: loadTransactions().items, goals: loadSavingsGoals().items };
}

function persistTransactions(next: readonly Transaction[]): void {
  if (!saveTransactions(next)) throw new FinanceError(SAVE_FAILED_MESSAGE);
}

function persistGoals(next: readonly SavingsGoal[]): void {
  if (!saveSavingsGoals(next)) throw new FinanceError(SAVE_FAILED_MESSAGE);
}

/** Simpan transaksi & target bersamaan; bila target gagal, transaksi dikembalikan. */
function persistBoth(
  nextTransactions: readonly Transaction[],
  nextGoals: readonly SavingsGoal[],
  previousTransactions: readonly Transaction[],
): void {
  persistTransactions(nextTransactions);
  if (!saveSavingsGoals(nextGoals)) {
    saveTransactions(previousTransactions);
    throw new FinanceError(SAVE_FAILED_MESSAGE);
  }
}

function adjustGoalSaved(goals: readonly SavingsGoal[], goalId: string, delta: number, now: string): SavingsGoal[] {
  return goals.map((goal) =>
    goal.id === goalId
      ? { ...goal, savedAmount: Math.min(MAX_AMOUNT, Math.max(0, goal.savedAmount + delta)), updatedAt: now }
      : goal,
  );
}

function persistWithGoalDelta(
  nextTransactions: Transaction[],
  previousTransactions: Transaction[],
  goals: SavingsGoal[],
  goalId: string | undefined,
  delta: number,
  now: string,
): void {
  if (!goalId || delta === 0 || !goals.some((goal) => goal.id === goalId)) {
    persistTransactions(nextTransactions);
    return;
  }
  persistBoth(nextTransactions, adjustGoalSaved(goals, goalId, delta, now), previousTransactions);
}

export function createLocalRepository(): LocalRepository {
  return {
    async load() {
      const transactions = loadTransactions();
      const goals = loadSavingsGoals();
      return {
        transactions: transactions.items,
        goals: goals.items,
        notice: resolveNotice([transactions.status, goals.status]),
      };
    },

    async addTransaction(input) {
      const { transactions } = readAll();
      const now = timestamp();
      persistTransactions([{ ...input, id: createId(), createdAt: now, updatedAt: now }, ...transactions]);
    },

    async updateTransaction(id, input) {
      const { transactions, goals } = readAll();
      const existing = transactions.find((item) => item.id === id);
      if (!existing) throw notFoundError("Transaksi");

      const now = timestamp();
      const updated: Transaction = { ...existing, ...input, updatedAt: now };
      const next = transactions.map((item) => (item.id === id ? updated : item));
      const delta = getGoalContribution(updated) - getGoalContribution(existing);
      persistWithGoalDelta(next, transactions, goals, existing.goalId, delta, now);
    },

    async deleteTransaction(id) {
      const { transactions, goals } = readAll();
      const existing = transactions.find((item) => item.id === id);
      if (!existing) throw notFoundError("Transaksi");

      const next = transactions.filter((item) => item.id !== id);
      persistWithGoalDelta(next, transactions, goals, existing.goalId, -getGoalContribution(existing), timestamp());
    },

    async addSavingsGoal(input) {
      const { goals } = readAll();
      const now = timestamp();
      persistGoals([{ ...input, id: createId(), createdAt: now, updatedAt: now }, ...goals]);
    },

    async updateSavingsGoal(id, input) {
      const { goals } = readAll();
      if (!goals.some((goal) => goal.id === id)) throw notFoundError("Target");
      const now = timestamp();
      persistGoals(goals.map((goal) => (goal.id === id ? { ...goal, ...input, updatedAt: now } : goal)));
    },

    async deleteSavingsGoal(id) {
      const { goals } = readAll();
      const next = goals.filter((goal) => goal.id !== id);
      if (next.length === goals.length) throw notFoundError("Target");
      persistGoals(next);
    },

    async addFundsToGoal(goal, { amount, date }) {
      const { transactions, goals } = readAll();
      const current = goals.find((item) => item.id === goal.id);
      if (!current) throw notFoundError("Target");
      if (current.savedAmount + amount > MAX_AMOUNT) throw new FinanceError("Nominal terlalu besar.");

      const now = timestamp();
      const transaction: Transaction = {
        id: createId(),
        type: "expense",
        title: goalTransferTitle(current.title),
        amount,
        category: "savings",
        date,
        note: GOAL_TRANSFER_NOTE,
        goalId: current.id,
        createdAt: now,
        updatedAt: now,
      };
      persistBoth([transaction, ...transactions], adjustGoalSaved(goals, current.id, amount, now), transactions);
    },

    clear() {
      removeKey(TRANSACTIONS_STORAGE_KEY);
      removeKey(SAVINGS_STORAGE_KEY);
    },
  };
}