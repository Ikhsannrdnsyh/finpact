"use client";

import { useState, type ReactNode } from "react";
import { Alert, type Feedback } from "@/components/ui/Alert";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { formatRupiah } from "@/lib/money";
import { deleteTransaction, updateTransaction } from "@/store/finance-store";
import type { ActionResult, Transaction, TransactionInput } from "@/types/finance";
import { TransactionForm } from "./TransactionForm";
import { TransactionListItem } from "./TransactionListItem";

interface TransactionListProps {
  transactions: readonly Transaction[];
  emptyState: ReactNode;
}

/** Daftar transaksi + alur edit (dialog) dan hapus (konfirmasi). Dipakai di Catat Uang & Riwayat. */
export function TransactionList({ transactions, emptyState }: TransactionListProps) {
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function handleUpdate(input: TransactionInput): Promise<ActionResult> {
    if (!editing) return { ok: false, message: "Transaksi tidak ditemukan." };
    const result = await updateTransaction(editing.id, input);
    if (result.ok) {
      setEditing(null);
      setFeedback({ kind: "success", message: "Perubahan transaksi disimpan." });
    }
    return result;
  }

  async function handleConfirmDelete() {
    if (!deleting || isDeleting) return;
    const target = deleting;
    setIsDeleting(true);
    const result = await deleteTransaction(target.id);
    setIsDeleting(false);
    setFeedback(
      result.ok
        ? { kind: "success", message: `Transaksi "${target.title}" sudah dihapus.` }
        : { kind: "error", message: result.message },
    );
    setDeleting(null);
  }

  return (
    <div>
      {feedback && (
        <div className="mb-3">
          <Alert feedback={feedback} onDismiss={() => setFeedback(null)} />
        </div>
      )}

      {transactions.length === 0 ? (
        emptyState
      ) : (
        <ul className="divide-y divide-border">
          {transactions.map((transaction) => (
            <TransactionListItem
              key={transaction.id}
              transaction={transaction}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          ))}
        </ul>
      )}

      <Modal open={editing !== null} title="Edit Transaksi" onClose={() => setEditing(null)}>
        {editing?.goalId && (
          <p className="mb-4 rounded-xl bg-primary-light p-3 text-sm text-primary-dark">
            Transaksi ini terhubung ke target tabungan. Mengubah nominal akan ikut mengubah progres target.
          </p>
        )}
        {editing && (
          <TransactionForm
            key={editing.id}
            mode="edit"
            initial={editing}
            submitLabel="Simpan Perubahan"
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Hapus transaksi?"
        description={
          deleting
            ? `"${deleting.title}" (${formatRupiah(deleting.amount)}) akan dihapus dan saldo akan dihitung ulang.${
                deleting.goalId ? " Progres target tabungan yang terkait juga akan dikurangi." : ""
              }`
            : ""
        }
        pending={isDeleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}