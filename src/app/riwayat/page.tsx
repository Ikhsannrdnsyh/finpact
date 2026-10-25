import type { Metadata } from "next";
import { HistoryView } from "@/features/transactions/components/HistoryView";

export const metadata: Metadata = { title: "Riwayat" };

export default function RiwayatPage() {
  return <HistoryView />;
}