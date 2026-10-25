"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Sparkles, Target } from "lucide-react";
import { LocalDataNote } from "@/components/layout/LocalDataNote";
import { PageHeader } from "@/components/layout/PageHeader";
import { buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  buildChartSeries,
  calculateSummary,
  filterTransactions,
  sortByNewest,
} from "@/features/transactions/calculations";
import { useFinanceData } from "@/hooks/use-finance-data";
import { todayISO } from "@/lib/dates";
import type { Period } from "@/types/finance";
import { PeriodSummaryCard } from "./PeriodSummaryCard";
import { RecentTransactions } from "./RecentTransactions";
import { SavingsOverview } from "./SavingsOverview";
import { BalanceCard } from "./SummaryCards";

const RECENT_LIMIT = 5;

function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/transaksi#catat" className={buttonClasses("primary")}>
        <Plus className="size-4" /> Catat Uang
      </Link>
      <Link href="/tabungan#tambah-target" className={buttonClasses("secondary")}>
        <Target className="size-4" /> Tambah Target
      </Link>
    </div>
  );
}

export function DashboardView() {
  const { status, transactions, goals } = useFinanceData();
  const [period, setPeriod] = useState<Period>("this-month");

  if (status === "loading") return <LoadingState />;

  const today = todayISO();
  const { balance } = calculateSummary(transactions);
  const periodSummary = calculateSummary(filterTransactions(transactions, { period, today }));
  const chartData = buildChartSeries(transactions, period, today);
  const recent = sortByNewest(transactions).slice(0, RECENT_LIMIT);
  const isFirstVisit = transactions.length === 0 && goals.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Halo, Siswa! 👋" description="Yuk, lihat ke mana uang jajanmu pergi." action={<QuickActions />} />

      {isFirstVisit && (
        <Card>
          <EmptyState
            icon={Sparkles}
            title="Mulai catat uangmu"
            description="Belum ada data. Catat uang saku pertamamu, lalu buat target tabungan. Semua data disimpan di browser ini saja."
            action={<QuickActions />}
          />
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <BalanceCard balance={balance} />
        <PeriodSummaryCard
          className="lg:col-span-2 lg:row-span-2"
          period={period}
          onPeriodChange={setPeriod}
          summary={periodSummary}
          chartData={chartData}
        />
        <SavingsOverview goals={goals} />
      </div>

      <RecentTransactions transactions={recent} />
      <LocalDataNote className="md:hidden" />
    </div>
  );
}