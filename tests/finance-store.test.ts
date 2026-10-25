import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { calculateSummary } from "@/features/transactions/calculations";
import type { TransactionInput } from "@/types/finance";
import { MemoryStorage } from "./helpers";

const TRANSACTIONS_KEY = "finpact.transactions.v1";
const GOALS_KEY = "finpact.savings-goals.v1";

let storage: MemoryStorage;

beforeEach(() => {
  vi.resetModules();
  // Pastikan test selalu memakai mode tamu (browser), bukan Supabase.
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
  storage = new MemoryStorage();
  vi.stubGlobal("window", { localStorage: storage });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

async function loadStore() {
  const store = await import("@/store/finance-store");
  await store.initializeFinanceStore();
  return store;
}

const income: TransactionInput = {
  type: "income",
  title: "Uang saku",
  amount: 50000,
  category: "allowance",
  date: "2026-10-20",
};

const expense: TransactionInput = {
  type: "expense",
  title: "Beli bakso",
  amount: 12000,
  category: "food",
  date: "2026-10-21",
};

describe("finance store (mode tamu)", () => {
  it("mulai dalam mode tamu dan siap dipakai", async () => {
    const store = await loadStore();
    expect(store.getSnapshot()).toMatchObject({ status: "ready", mode: "guest" });
  });

  it("alur tambah, edit, hapus memperbarui saldo tanpa duplikasi", async () => {
    const store = await loadStore();
    const balance = () => calculateSummary(store.getSnapshot().transactions).balance;

    expect(balance()).toBe(0);
    expect((await store.addTransaction(income)).ok).toBe(true);
    expect(balance()).toBe(50000);
    expect((await store.addTransaction(expense)).ok).toBe(true);
    expect(balance()).toBe(38000);

    const target = store.getSnapshot().transactions.find((t) => t.title === "Beli bakso");
    if (!target) throw new Error("transaksi tidak ditemukan");

    expect((await store.updateTransaction(target.id, { ...expense, amount: 20000 })).ok).toBe(true);
    expect(store.getSnapshot().transactions).toHaveLength(2);
    expect(balance()).toBe(30000);

    expect((await store.deleteTransaction(target.id)).ok).toBe(true);
    expect(store.getSnapshot().transactions).toHaveLength(1);
    expect(balance()).toBe(50000);
  });

  it("data tetap ada setelah 'refresh' (modul dimuat ulang)", async () => {
    const first = await loadStore();
    await first.addTransaction(income);
    await first.addSavingsGoal({ title: "Headset", targetAmount: 200000, savedAmount: 50000 });

    vi.resetModules();
    const reloaded = await loadStore();
    expect(reloaded.getSnapshot().transactions).toHaveLength(1);
    expect(reloaded.getSnapshot().goals[0]?.title).toBe("Headset");
  });

  it("melaporkan kegagalan simpan tanpa mengubah state", async () => {
    const store = await loadStore();
    storage.setItem = () => {
      throw new Error("QuotaExceededError");
    };

    expect((await store.addTransaction(income)).ok).toBe(false);
    expect(store.getSnapshot().transactions).toHaveLength(0);
  });

  it("tambah dana ke target mencatat transaksi; edit & hapus menyesuaikan progres", async () => {
    const store = await loadStore();
    const balance = () => calculateSummary(store.getSnapshot().transactions).balance;

    await store.addTransaction(income);
    await store.addSavingsGoal({ title: "Headset", targetAmount: 200000, savedAmount: 0 });
    const goal = store.getSnapshot().goals[0];
    if (!goal) throw new Error("target tidak ada");

    expect((await store.addFundsToGoal(goal.id, { amount: 20000, date: "2026-10-22" })).ok).toBe(true);
    expect(store.getSnapshot().goals[0]?.savedAmount).toBe(20000);
    expect(balance()).toBe(30000);

    const linked = store.getSnapshot().transactions.find((t) => t.goalId === goal.id);
    if (!linked) throw new Error("transaksi tabungan tidak ada");
    expect(linked).toMatchObject({ type: "expense", category: "savings", amount: 20000 });

    await store.updateTransaction(linked.id, {
      type: linked.type,
      title: linked.title,
      amount: 25000,
      category: linked.category,
      date: linked.date,
    });
    expect(store.getSnapshot().goals[0]?.savedAmount).toBe(25000);
    expect(store.getSnapshot().transactions.find((t) => t.id === linked.id)?.goalId).toBe(goal.id);

    await store.deleteTransaction(linked.id);
    expect(store.getSnapshot().goals[0]?.savedAmount).toBe(0);
    expect(balance()).toBe(50000);
  });

  it("membatalkan simpanan transaksi bila simpan target gagal", async () => {
    const store = await loadStore();
    await store.addTransaction(income);
    await store.addSavingsGoal({ title: "Sepatu", targetAmount: 100000, savedAmount: 0 });
    const goal = store.getSnapshot().goals[0];
    if (!goal) throw new Error("target tidak ada");

    const transactionsBefore = storage.getItem(TRANSACTIONS_KEY);
    const goalsBefore = storage.getItem(GOALS_KEY);
    expect(transactionsBefore).not.toBeNull();

    const originalSetItem = storage.setItem.bind(storage);
    storage.setItem = (key: string, value: string) => {
      if (key === GOALS_KEY) throw new Error("QuotaExceededError");
      originalSetItem(key, value);
    };

    expect((await store.addFundsToGoal(goal.id, { amount: 10000, date: "2026-10-22" })).ok).toBe(false);
    expect(store.getSnapshot().transactions).toHaveLength(1);
    expect(store.getSnapshot().goals[0]?.savedAmount).toBe(0);
    expect(storage.getItem(TRANSACTIONS_KEY)).toBe(transactionsBefore);
    expect(storage.getItem(GOALS_KEY)).toBe(goalsBefore);
  });
});