import {
  BookOpen,
  Bus,
  Gamepad2,
  PiggyBank,
  Shapes,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { TransactionCategory, TransactionType } from "@/types/finance";

const CATEGORY_ICONS: Record<TransactionCategory, LucideIcon> = {
  allowance: Wallet,
  food: UtensilsCrossed,
  transport: Bus,
  school: BookOpen,
  entertainment: Gamepad2,
  savings: PiggyBank,
  other: Shapes,
};

export function CategoryIcon({ category, type }: { category: TransactionCategory; type: TransactionType }) {
  const Icon = CATEGORY_ICONS[category];
  return (
    <span
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-xl",
        type === "income" ? "bg-income-light text-income" : "bg-expense-light text-expense",
      )}
    >
      <Icon className="size-5" />
    </span>
  );
}