"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { Alert, type Feedback } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, fieldA11y } from "@/components/ui/FormField";
import { formatRupiah, parseRupiahInput } from "@/lib/money";
import type { ActionResult, SavingsGoal, SavingsGoalInput } from "@/types/finance";
import {
  GOAL_TITLE_MAX_LENGTH,
  createEmptySavingsGoalForm,
  savingsGoalToFormValues,
  validateSavingsGoalForm,
  type SavingsGoalField,
  type SavingsGoalFormErrors,
  type SavingsGoalFormValues,
} from "../validation";

interface SavingsGoalFormProps {
  mode: "create" | "edit";
  initial?: SavingsGoal;
  onSubmit: (input: SavingsGoalInput) => Promise<ActionResult>;
  onCancel?: () => void;
}

function amountHint(raw: string, fallback: string): string {
  const parsed = parseRupiahInput(raw);
  return parsed ? `Tercatat sebagai ${formatRupiah(parsed)}` : fallback;
}

export function SavingsGoalForm({ mode, initial, onSubmit, onCancel }: SavingsGoalFormProps) {
  const formId = useId();
  const [values, setValues] = useState<SavingsGoalFormValues>(() =>
    initial ? savingsGoalToFormValues(initial) : createEmptySavingsGoalForm(),
  );
  const [errors, setErrors] = useState<SavingsGoalFormErrors>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);
  const lockedRef = useRef(false);

  const fieldId = (name: SavingsGoalField) => `${formId}-${name}`;

  function updateField(key: SavingsGoalField, value: string) {
    lockedRef.current = false;
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setFeedback(null);
  }

  function resetForm() {
    lockedRef.current = false;
    setValues(createEmptySavingsGoalForm());
    setErrors({});
    setFeedback(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingRef.current || lockedRef.current) return;

    const validation = validateSavingsGoalForm(values);
    if (!validation.ok) {
      setErrors(validation.errors);
      setFeedback({ kind: "error", message: "Ada isian yang perlu diperbaiki." });
      return;
    }

    savingRef.current = true;
    setIsSaving(true);
    const result = await onSubmit(validation.value);
    savingRef.current = false;
    setIsSaving(false);

    if (!result.ok) {
      setFeedback({ kind: "error", message: result.message });
      return;
    }

    lockedRef.current = true;
    if (mode === "create") {
      setValues(createEmptySavingsGoalForm());
      setErrors({});
      setFeedback({ kind: "success", message: "Target tabungan berhasil dibuat. Semangat!" });
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} noValidate className="space-y-4">
      <Field id={fieldId("title")} label="Nama target" error={errors.title}>
        <TextInput
          id={fieldId("title")}
          value={values.title}
          maxLength={GOAL_TITLE_MAX_LENGTH}
          placeholder="Contoh: Beli headset"
          autoComplete="off"
          onChange={(event) => updateField("title", event.target.value)}
          {...fieldA11y(fieldId("title"), errors.title)}
        />
      </Field>

      <Field
        id={fieldId("targetAmount")}
        label="Nominal target"
        error={errors.targetAmount}
        hint={amountHint(values.targetAmount, "Contoh: 250000")}
      >
        <TextInput
          id={fieldId("targetAmount")}
          inputMode="numeric"
          autoComplete="off"
          placeholder="250.000"
          value={values.targetAmount}
          onChange={(event) => updateField("targetAmount", event.target.value)}
          {...fieldA11y(fieldId("targetAmount"), errors.targetAmount, true)}
        />
      </Field>

      <Field
        id={fieldId("savedAmount")}
        label="Sudah terkumpul"
        optional
        error={errors.savedAmount}
        hint={amountHint(values.savedAmount, "Untuk uang yang sudah terkumpul sebelumnya. Tidak mengubah saldo.")}
      >
        <TextInput
          id={fieldId("savedAmount")}
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          value={values.savedAmount}
          onChange={(event) => updateField("savedAmount", event.target.value)}
          {...fieldA11y(fieldId("savedAmount"), errors.savedAmount, true)}
        />
      </Field>

      <Field id={fieldId("deadline")} label="Tenggat" optional error={errors.deadline}>
        <TextInput
          id={fieldId("deadline")}
          type="date"
          value={values.deadline}
          onChange={(event) => updateField("deadline", event.target.value)}
          {...fieldA11y(fieldId("deadline"), errors.deadline)}
        />
      </Field>

      {feedback && <Alert feedback={feedback} onDismiss={() => setFeedback(null)} />}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel ?? resetForm} disabled={isSaving}>
          {onCancel ? "Batal" : "Kosongkan"}
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isSaving ? "Menyimpan..." : mode === "create" ? "Simpan Target" : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
}