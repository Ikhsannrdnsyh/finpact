import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { TransactionListItem } from "@/features/transactions/components/TransactionListItem";
import type { Transaction } from "@/types/finance";

export function RecentTransactions({ transactions }: { transactions: readonly Transaction[] }) {
  return (
    <Card>
      <CardHeader
        title="Transaksi Terbaru"
        action={
          <Link href="/riwayat" className="text-sm font-semibold text-primary hover:underline">
            Lihat semua
          </Link>
        }
      />
      {transactions.length === 0 ? (
        <p className="text-sm text-muted">
          Belum ada transaksi.{" "}
          <Link href="/transaksi#catat" className="font-semibold text-primary hover:underline">
            Catat sekarang
          </Link>
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {transactions.map((transaction) => (
            <TransactionListItem key={transaction.id} transaction={transaction} />
          ))}
        </ul>
      )}
    </Card>
  );
}