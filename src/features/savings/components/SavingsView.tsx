"use client";

import { useState } from "react";
import { PiggyBank } from "lucide-react";
import { DataStatus } from "@/components/layout/DataStatus";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert, type Feedback } from "@/components/ui/Alert";
import { Card, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { calculateSummary } from "@/features/transactions/calculations";
import { useFinanceData } from "@/hooks/use-finance-data";
import { todayISO } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";
import { addFundsToGoal, addSavingsGoal, deleteSavingsGoal, updateSavingsGoal } from "@/store/finance-store";
import type { ActionResult, AddFundsInput, SavingsGoal, SavingsGoalInput } from "@/types/finance";
import { sortGoals, summarizeGoals } from "../calculations";
import { AddFundsForm } from "./AddFundsForm";
import { SavingsGoalCard } from "./SavingsGoalCard";
import { SavingsGoalForm } from "./SavingsGoalForm";

export function SavingsView() {
  const { status, goals, transactions } = useFinanceData();
  const [funding, setFunding] = useState<SavingsGoal | null>(null);
  const [editing, setEditing] = useState<SavingsGoal | null>(null);
  const [deleting, setDeleting] = useState<SavingsGoal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  if (status !== "ready") return <DataStatus />;

  const today = todayISO();
  const sortedGoals = sortGoals(goals);
  const summary = summarizeGoals(goals);
  const balance = calculateSummary(transactions).balance;

  async function handleAddFunds(input: AddFundsInput): Promise<ActionResult> {
    if (!funding) return { ok: false, message: "Target tidak ditemukan." };
    const target = funding;
    const result = await addFundsToGoal(target.id, input);
    if (result.ok) {
      setFeedback({
        kind: "success",
        message: `${formatRupiah(input.amount)} ditambahkan ke "${target.title}" dan tercatat di Riwayat.`,
      });
      setFunding(null);
    }
    return result;
  }

  async function handleUpdate(input: SavingsGoalInput): Promise<ActionResult> {
    if (!editing) return { ok: false, message: "Target tidak ditemukan." };
    const result = await updateSavingsGoal(editing.id, input);
    if (result.ok) {
      setEditing(null);
      setFeedback({ kind: "success", message: "Perubahan target disimpan." });
    }
    return result;
  }

  async function handleConfirmDelete() {
    if (!deleting || isDeleting) return;
    const target = deleting;
    setIsDeleting(true);
    const result = await deleteSavingsGoal(target.id);
    setIsDeleting(false);
    setFeedback(
      result.ok
        ? { kind: "success", message: `Target "${target.title}" sudah dihapus.` }
        : { kind: "error", message: result.message },
    );
    setDeleting(null);
  }

  return (
    <>
      <PageHeader title="Tabungan" description="Sedikit demi sedikit, lama-lama tercapai!" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
        <Card id="tambah-target" className="scroll-mt-24">
          <CardHeader title="Buat Target Baru" />
          <SavingsGoalForm mode="create" onSubmit={addSavingsGoal} />
        </Card>

        <section aria-labelledby="daftar-target" className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="daftar-target" className="text-lg font-bold">
              Target Kamu
            </h2>
            {goals.length > 0 && (
              <p className="text-sm text-muted">
                {formatRupiah(summary.totalSaved)} terkumpul dari {formatRupiah(summary.totalTarget)} ·{" "}
                {summary.completed} tercapai
              </p>
            )}
          </div>

          {feedback && <Alert feedback={feedback} onDismiss={() => setFeedback(null)} />}

          {sortedGoals.length === 0 ? (
            <Card>
              <EmptyState
                icon={PiggyBank}
                title="Belum ada target tabungan"
                description="Mau beli sepatu, headset, atau jalan-jalan? Buat target pertamamu lewat form di samping."
              />
            </Card>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {sortedGoals.map((goal) => (
                <li key={goal.id}>
                  <SavingsGoalCard
                    goal={goal}
                    today={today}
                    onAddFunds={setFunding}
                    onEdit={setEditing}
                    onDelete={setDeleting}
                  />
                </li>
              ))}
            </ul>
          )}

          <Alert
            feedback={{
              kind: "info",
              message:
                "Pakai tombol Tambah Dana saat menyisihkan uang: progres target bertambah dan tercatat sebagai Uang Keluar kategori Tabungan, jadi saldo tetap sesuai. Mengubah angka terkumpul lewat Edit tidak mengubah saldo.",
            }}
          />
        </section>
      </div>

      <Modal open={funding !== null} title="Tambah Dana" onClose={() => setFunding(null)}>
        {funding && (
          <AddFundsForm
            key={funding.id}
            goal={funding}
            balance={balance}
            onSubmit={handleAddFunds}
            onCancel={() => setFunding(null)}
          />
        )}
      </Modal>

      <Modal open={editing !== null} title="Edit Target" onClose={() => setEditing(null)}>
        {editing && (
          <SavingsGoalForm
            key={editing.id}
            mode="edit"
            initial={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Hapus target?"
        description={
          deleting
            ? `Target "${deleting.title}" dan progresnya akan dihapus. Transaksi tabungan yang sudah tercatat tetap ada di Riwayat.`
            : ""
        }
        pending={isDeleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}