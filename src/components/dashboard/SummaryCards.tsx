import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import { TRANSACTION_TYPE_LABELS } from "@/features/transactions/constants";
import { cn } from "@/lib/cn";
import { formatRupiah } from "@/lib/money";
import type { TransactionType } from "@/types/finance";

export function BalanceCard({ balance }: { balance: number }) {
  return (
    <div className="rounded-2xl bg-linear-to-br from-primary to-primary-dark p-5 text-white shadow-lg shadow-primary/20">
      <p className="flex items-center gap-2 text-sm font-medium text-white/85">
        <Wallet className="size-4" />
        Total Saldo
      </p>
      <p className="mt-2 wrap-break-word text-3xl font-extrabold tracking-tight">{formatRupiah(balance)}</p>
      <p className="mt-2 text-sm text-white/80">Semua uang masuk dikurangi semua uang keluar.</p>
      {balance < 0 && (
        <p className="mt-3 rounded-lg bg-white/15 px-3 py-2 text-xs">
          Uang keluar tercatat lebih besar dari uang masuk. Mungkin ada uang masuk yang belum dicatat?
        </p>
      )}
    </div>
  );
}

export function FlowCard({ type, amount }: { type: TransactionType; amount: number }) {
  const isIncome = type === "income";
  const Icon = isIncome ? ArrowDownLeft : ArrowUpRight;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border p-3 sm:p-4">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          isIncome ? "bg-income-light text-income" : "bg-expense-light text-expense",
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-muted">{TRANSACTION_TYPE_LABELS[type]}</p>
        <p className={cn("wrap-break-word font-bold sm:text-lg", isIncome ? "text-income" : "text-expense")}>
          {formatRupiah(amount)}
        </p>
      </div>
    </div>
  );
}