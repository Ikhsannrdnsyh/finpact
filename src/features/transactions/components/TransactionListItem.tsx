import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";
import type { Transaction } from "@/types/finance";
import { CATEGORY_LABELS, TRANSACTION_TYPE_LABELS } from "../constants";
import { CategoryIcon } from "./CategoryIcon";

interface TransactionListItemProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}

export function TransactionListItem({ transaction, onEdit, onDelete }: TransactionListItemProps) {
  const isIncome = transaction.type === "income";

  return (
    <li className="flex items-center gap-3 py-3">
      <CategoryIcon category={transaction.category} type={transaction.type} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{transaction.title}</p>
        <p className="truncate text-sm text-muted">
          {CATEGORY_LABELS[transaction.category]} · {formatDate(transaction.date)}
        </p>
        {transaction.note && <p className="truncate text-xs text-muted">{transaction.note}</p>}
      </div>
      <div className="shrink-0 text-right">
        <p className={cn("whitespace-nowrap font-bold", isIncome ? "text-income" : "text-expense")}>
          {isIncome ? "+" : "-"}
          {formatRupiah(transaction.amount)}
        </p>
        <p className="text-xs text-muted">{TRANSACTION_TYPE_LABELS[transaction.type]}</p>
      </div>
      {(onEdit || onDelete) && (
        <div className="flex shrink-0">
          {onEdit && (
            <Button variant="ghost" size="icon" onClick={() => onEdit(transaction)} aria-label={`Edit ${transaction.title}`}>
              <Pencil className="size-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(transaction)}
              aria-label={`Hapus ${transaction.title}`}
              className="hover:bg-expense-light hover:text-expense"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      )}
    </li>
  );
}