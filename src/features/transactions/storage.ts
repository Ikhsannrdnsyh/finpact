import { readList, writeList } from "@/lib/storage/local-storage";
import type { Transaction } from "@/types/finance";
import { isTransaction } from "./validation";

export const TRANSACTIONS_STORAGE_KEY = "finpact.transactions.v1";

export function loadTransactions() {
  return readList(TRANSACTIONS_STORAGE_KEY, isTransaction);
}

export function saveTransactions(transactions: readonly Transaction[]): boolean {
  return writeList(TRANSACTIONS_STORAGE_KEY, transactions);
}