import type { Metadata } from "next";
import { TransactionsView } from "@/features/transactions/components/TransactionsView";

export const metadata: Metadata = { title: "Catat Uang" };

export default function TransaksiPage() {
  return <TransactionsView />;
}