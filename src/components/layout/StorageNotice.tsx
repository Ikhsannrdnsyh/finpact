"use client";

import { useState } from "react";
import { CloudUpload, LoaderCircle } from "lucide-react";
import { Alert, type Feedback } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useFinanceData } from "@/hooks/use-finance-data";
import { dismissImport, dismissStorageNotice, importLocalData } from "@/store/finance-store";

const MESSAGES = {
  unavailable:
    "Penyimpanan browser tidak bisa dipakai (mungkin mode privat atau diblokir). Data yang kamu catat tidak akan tersimpan. Masuk ke akun supaya data tersimpan aman.",
  recovered:
    "Sebagian data lama rusak sehingga tidak bisa dibaca dan dilewati. Salinan cadangannya tetap disimpan di browser ini.",
} as const;

export function StorageNotice() {
  const { notice, pendingImport } = useFinanceData();
  const [importing, setImporting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  if (!notice && !pendingImport && !feedback) return null;

  async function handleImport() {
    setImporting(true);
    const result = await importLocalData();
    setImporting(false);
    setFeedback(
      result.ok
        ? { kind: "success", message: "Data dari browser ini sudah dipindahkan ke akunmu." }
        : { kind: "error", message: result.message },
    );
  }

  return (
    <div className="mb-6 space-y-3">
      {notice && (
        <Alert
          feedback={{ kind: notice === "unavailable" ? "error" : "info", message: MESSAGES[notice] }}
          onDismiss={dismissStorageNotice}
        />
      )}

      {pendingImport && (
        <Card className="border-primary/30 bg-primary-light">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <CloudUpload className="size-8 shrink-0 text-primary" />
            <div className="flex-1">
              <p className="font-bold">Pindahkan data lama ke akunmu?</p>
              <p className="mt-1 text-sm text-muted">
                Ada {pendingImport.transactions} transaksi dan {pendingImport.goals} target tabungan di browser ini.
                Setelah dipindahkan, datanya bisa dibuka dari perangkat lain dan salinan di browser ini dihapus.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="ghost" onClick={dismissImport} disabled={importing}>
                Nanti saja
              </Button>
              <Button onClick={() => void handleImport()} disabled={importing}>
                {importing && <LoaderCircle className="size-4 animate-spin" />}
                {importing ? "Memindahkan..." : "Pindahkan"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {feedback && <Alert feedback={feedback} onDismiss={() => setFeedback(null)} />}
    </div>
  );
}