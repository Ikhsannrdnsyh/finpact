"use client";

import Link from "next/link";
import { useState } from "react";
import { History, Search, SearchX } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TextInput } from "@/components/ui/FormField";
import { LoadingState } from "@/components/ui/LoadingState";
import { useFinanceData } from "@/hooks/use-finance-data";
import { formatRupiah } from "@/lib/money";
import type { Period, TypeFilter } from "@/types/finance";
import { calculateSummary, filterTransactions, sortByNewest } from "../calculations";
import { PeriodSelect } from "./PeriodSelect";
import { TransactionList } from "./TransactionList";
import { TypeFilterTabs } from "./TypeFilterTabs";

export function HistoryView() {
  const { status, transactions } = useFinanceData();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [period, setPeriod] = useState<Period>("all");

  if (status === "loading") return <LoadingState />;

  const filtered = sortByNewest(filterTransactions(transactions, { type: typeFilter, period, query }));
  const summary = calculateSummary(filtered);
  const hasActiveFilters = query.trim() !== "" || typeFilter !== "all" || period !== "all";

  function resetFilters() {
    setQuery("");
    setTypeFilter("all");
    setPeriod("all");
  }

  const emptyState =
    transactions.length === 0 ? (
      <EmptyState
        icon={History}
        title="Belum ada riwayat"
        description="Transaksi yang kamu catat akan muncul di sini."
        action={
          <Link href="/transaksi#catat" className={buttonClasses("primary")}>
            Catat transaksi pertama
          </Link>
        }
      />
    ) : (
      <EmptyState
        icon={SearchX}
        title="Tidak ada transaksi yang cocok"
        description="Coba kata kunci lain atau ubah filternya."
        action={
          hasActiveFilters ? (
            <Button variant="secondary" onClick={resetFilters}>
              Reset filter
            </Button>
          ) : undefined
        }
      />
    );

  return (
    <>
      <PageHeader title="Riwayat" description="Cari dan kelola semua transaksi yang pernah kamu catat." />
      <Card>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative lg:w-80">
            <label htmlFor="history-search" className="sr-only">
              Cari nama transaksi
            </label>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <TextInput
              id="history-search"
              type="search"
              placeholder="Cari nama transaksi..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <TypeFilterTabs value={typeFilter} onChange={setTypeFilter} />
            <PeriodSelect id="history-period" value={period} onChange={setPeriod} />
          </div>
        </div>

        <p className="mt-4 rounded-xl bg-primary-light px-4 py-2.5 text-sm text-primary-dark" aria-live="polite">
          {summary.count} transaksi · Masuk <strong className="text-income">{formatRupiah(summary.income)}</strong> ·
          Keluar <strong className="text-expense">{formatRupiah(summary.expense)}</strong>
        </p>

        <div className="mt-2">
          <TransactionList transactions={filtered} emptyState={emptyState} />
        </div>
      </Card>
    </>
  );
}