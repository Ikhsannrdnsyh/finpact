import { History, House, PencilLine, PiggyBank, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/transaksi", label: "Catat Uang", icon: PencilLine },
  { href: "/tabungan", label: "Tabungan", icon: PiggyBank },
  { href: "/riwayat", label: "Riwayat", icon: History },
];