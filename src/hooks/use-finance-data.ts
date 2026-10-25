import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, subscribe } from "@/store/finance-store";

export function useFinanceData() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}