import type { Metadata } from "next";
import { SavingsView } from "@/features/savings/components/SavingsView";

export const metadata: Metadata = { title: "Tabungan" };

export default function TabunganPage() {
  return <SavingsView />;
}