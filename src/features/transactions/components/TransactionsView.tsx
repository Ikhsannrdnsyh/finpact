"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ReceiptText } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useFinanceData } from "@/hooks/use-finance-data";
import { addTransaction } from "@/store/finance-store";
import type { TypeFilter } from "@/types/finance";
import { filterTransactions, sortByNewest } from "../calculations";
import { TransactionForm } from "./TransactionForm";
import { TransactionList } from "./TransactionList";
import { TypeFilterTabs } from "./TypeFilterTabs";

const LATEST_LIMIT = 8;

export function TransactionsView() {
  const router = useRouter();
  const { status, transactions } = useFinanceData();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  if (status === "loading") return <LoadingState />;

  const filtered = sortByNewest(filterTransactions(transactions, { type: typeFilter }));
  const latest = filtered.slice(0, LATEST_LIMIT);

  return (
    <>
      <PageHeader title="Catat Uang" description="Catat uang masuk atau keluar supaya saldomu selalu jelas." />
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <Card id="catat" className="scroll-mt-24">
          <CardHeader title="Tambah Transaksi" />
          <TransactionForm mode="create" submitLabel="Simpan" onSubmit={addTransaction} onCancel={() => router.push("/")} />
        </Card>

        <Card>
          <CardHeader title="Daftar Transaksi" action={<TypeFilterTabs value={typeFilter} onChange={setTypeFilter} />} />
          <TransactionList
            transactions={latest}
            emptyState={
              <EmptyState
                icon={ReceiptText}
                title={transactions.length === 0 ? "Belum ada transaksi" : "Belum ada transaksi jenis ini"}
                description={
                  transactions.length === 0
                    ? "Isi form di samping untuk mencatat transaksi pertamamu."
                    : "Coba pilih filter lain."
                }
              />
            }
          />
          {filtered.length > LATEST_LIMIT && (
            <Link href="/riwayat" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
              Lihat semua {filtered.length} transaksi di Riwayat
            </Link>
          )}
        </Card>
      </div>
    </>
  );
}