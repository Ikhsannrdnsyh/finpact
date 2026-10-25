import type { Transaction } from "@/types/finance";

export class MemoryStorage {
  private data = new Map<string, string>();
  get length() {
    return this.data.size;
  }
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, String(value));
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  clear() {
    this.data.clear();
  }
  key(index: number) {
    return [...this.data.keys()][index] ?? null;
  }
}

let counter = 0;
export function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  counter += 1;
  return {
    id: `tx-${counter}`,
    type: "income",
    title: "Uang saku",
    amount: 50000,
    category: "allowance",
    date: "2026-10-20",
    createdAt: `2026-10-20T08:00:${String(counter % 60).padStart(2, "0")}.000Z`,
    updatedAt: "2026-10-20T08:00:00.000Z",
    ...overrides,
  };
}