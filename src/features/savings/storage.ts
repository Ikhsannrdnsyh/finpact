import { readList, writeList } from "@/lib/storage/local-storage";
import type { SavingsGoal } from "@/types/finance";
import { isSavingsGoal } from "./validation";

export const SAVINGS_STORAGE_KEY = "finpact.savings-goals.v1";

export function loadSavingsGoals() {
  return readList(SAVINGS_STORAGE_KEY, isSavingsGoal);
}

export function saveSavingsGoals(goals: readonly SavingsGoal[]): boolean {
  return writeList(SAVINGS_STORAGE_KEY, goals);
}