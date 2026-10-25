"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { CirclePlus, LoaderCircle } from "lucide-react";
import { Alert, type Feedback } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, fieldA11y } from "@/components/ui/FormField";
import { todayISO } from "@/lib/dates";
import { formatAmountInput, formatRupiah, parseRupiahInput } from "@/lib/money";
import type { ActionResult, AddFundsInput, SavingsGoal } from "@/types/finance";
import { calculateGoalProgress } from "../calculations";
import {
  validateAddFundsForm,
  type AddFundsField,
  type AddFundsFormErrors,
  type AddFundsFormValues,
} from "../validation";

interface AddFundsFormProps {
  goal: SavingsGoal;
  balance: number;
  onSubmit: (input: AddFundsInput) => Promise<ActionResult>;
  onCancel: () => void;
}

function describeImpact(goal: SavingsGoal, balance: number, amount: number | null): string {
  if (amount === null) {
    return "Dana yang ditambahkan akan menambah progres target dan dicatat sebagai Uang Keluar kategori Tabungan, jadi saldomu ikut berkurang.";
  }
  const impact = `Progres "${goal.title}" naik ${formatRupiah(amount)} dan tercatat Uang Keluar kategori Tabungan. Saldo berubah dari ${formatRupiah(balance)} menjadi ${formatRupiah(balance - amount)}.`;
  return amount > balance
    ? `${impact} Nominal ini lebih besar dari saldo yang tercatat. Mungkin ada uang masuk yang belum dicatat?`
    : impact;
}

export function AddFundsForm({ goal, balance, onSubmit, onCancel }: AddFundsFormProps) {
  const formId = useId();
  const [values, setValues] = useState<AddFundsFormValues>(() => ({ amount: "", date: todayISO() }));
  const [errors, setErrors] = useState<AddFundsFormErrors>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);

  const progress = calculateGoalProgress(goal);
  const parsedAmount = parseRupiahInput(values.amount);
  const fieldId = (name: AddFundsField) => `${formId}-${name}`;

  function updateField(key: AddFundsField, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setFeedback(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingRef.current) return;

    const validation = validateAddFundsForm(values);
    if (!validation.ok) {
      setErrors(validation.errors);
      setFeedback({ kind: "error", message: "Ada isian yang perlu diperbaiki." });
      return;
    }

    savingRef.current = true;
    setIsSaving(true);
    const result = await onSubmit(validation.value);
    // Bila berhasil, dialog ditutup oleh induknya; kunci tetap aktif agar tidak tersimpan dua kali.
    if (!result.ok) {
      savingRef.current = false;
      setIsSaving(false);
      setFeedback({ kind: "error", message: result.message });
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} noValidate className="space-y-4">
      <p className="rounded-xl bg-primary-light p-3 text-sm text-primary-dark">
        Terkumpul <strong>{formatRupiah(goal.savedAmount)}</strong> dari {formatRupiah(goal.targetAmount)} (
        {progress.percent}%).
      </p>

      <Field
        id={fieldId("amount")}
        label="Nominal yang ditabung"
        error={errors.amount}
        hint={parsedAmount ? `Tercatat sebagai ${formatRupiah(parsedAmount)}` : "Contoh: 10000"}
      >
        <TextInput
          id={fieldId("amount")}
          inputMode="numeric"
          autoComplete="off"
          placeholder="10.000"
          value={values.amount}
          onChange={(event) => updateField("amount", event.target.value)}
          {...fieldA11y(fieldId("amount"), errors.amount, true)}
        />
      </Field>

      {progress.remaining > 0 && (
        <button
          type="button"
          onClick={() => updateField("amount", formatAmountInput(progress.remaining))}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Isi sisa target ({formatRupiah(progress.remaining)})
        </button>
      )}

      <Field id={fieldId("date")} label="Tanggal" error={errors.date}>
        <TextInput
          id={fieldId("date")}
          type="date"
          value={values.date}
          onChange={(event) => updateField("date", event.target.value)}
          {...fieldA11y(fieldId("date"), errors.date)}
        />
      </Field>

      <Alert feedback={{ kind: "info", message: describeImpact(goal, balance, parsedAmount) }} />
      {feedback && <Alert feedback={feedback} onDismiss={() => setFeedback(null)} />}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={isSaving}>
          Batal
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : <CirclePlus className="size-4" />}
          {isSaving ? "Menyimpan..." : "Tambah Dana"}
        </Button>
      </div>
    </form>
  );
}