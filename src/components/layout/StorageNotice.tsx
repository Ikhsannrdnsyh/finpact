"use client";

import { Alert } from "@/components/ui/Alert";
import { useFinanceData } from "@/hooks/use-finance-data";
import { dismissStorageNotice } from "@/store/finance-store";

const MESSAGES = {
  unavailable:
    "Penyimpanan browser tidak bisa dipakai (mungkin mode privat atau diblokir). Data yang kamu catat tidak akan tersimpan.",
  recovered:
    "Sebagian data lama rusak sehingga tidak bisa dibaca dan dilewati. Salinan cadangannya tetap disimpan di browser ini.",
} as const;

export function StorageNotice() {
  const { notice } = useFinanceData();
  if (!notice) return null;

  return (
    <div className="mb-6">
      <Alert
        feedback={{ kind: notice === "unavailable" ? "error" : "info", message: MESSAGES[notice] }}
        onDismiss={dismissStorageNotice}
      />
    </div>
  );
}