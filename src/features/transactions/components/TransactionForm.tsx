"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { ArrowDownLeft, ArrowUpRight, Save } from "lucide-react";
import { Alert, type Feedback } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, SelectInput, TextArea, TextInput, fieldA11y } from "@/components/ui/FormField";
import { cn } from "@/lib/cn";
import { todayISO } from "@/lib/dates";
import { formatRupiah, parseRupiahInput } from "@/lib/money";
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_TYPES,
  type ActionResult,
  type Transaction,
  type TransactionInput,
  type TransactionType,
} from "@/types/finance";
import {
  CATEGORY_LABELS,
  DEFAULT_CATEGORY,
  NOTE_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  TRANSACTION_TYPE_LABELS,
} from "../constants";
import {
  createEmptyTransactionForm,
  isTransactionCategory,
  transactionToFormValues,
  validateTransactionForm,
  type TransactionField,
  type TransactionFormErrors,
  type TransactionFormValues,
} from "../validation";

interface TransactionFormProps {
  mode: "create" | "edit";
  initial?: Transaction;
  submitLabel: string;
  onSubmit: (input: TransactionInput) => ActionResult;
  onCancel: () => void;
}

export function TransactionForm({ mode, initial, submitLabel, onSubmit, onCancel }: TransactionFormProps) {
  const formId = useId();
  const [values, setValues] = useState<TransactionFormValues>(() =>
    initial ? transactionToFormValues(initial) : createEmptyTransactionForm(todayISO()),
  );
  const [errors, setErrors] = useState<TransactionFormErrors>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  // Mengunci form saat menyimpan & setelah berhasil sampai pengguna mengubah isian lagi,
  // supaya klik "Simpan" berkali-kali tidak membuat transaksi ganda.
  const lockedRef = useRef(false);
  const titleRef = useRef<HTMLInputElement>(null);

  const fieldId = (name: TransactionField) => `${formId}-${name}`;
  const amountPreview = parseRupiahInput(values.amount);

  function updateField<K extends TransactionField>(key: K, value: TransactionFormValues[K]) {
    lockedRef.current = false;
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setFeedback(null);
  }

  function handleTypeChange(type: TransactionType) {
    lockedRef.current = false;
    setValues((current) => ({
      ...current,
      type,
      // Ganti kategori default otomatis, tapi jangan timpa pilihan pengguna.
      category: current.category === DEFAULT_CATEGORY[current.type] ? DEFAULT_CATEGORY[type] : current.category,
    }));
    setFeedback(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lockedRef.current) return;

    const validation = validateTransactionForm(values);
    if (!validation.ok) {
      setErrors(validation.errors);
      setFeedback({ kind: "error", message: "Ada isian yang perlu diperbaiki." });
      return;
    }

    lockedRef.current = true;
    const result = onSubmit(validation.value);
    if (!result.ok) {
      lockedRef.current = false;
      setFeedback({ kind: "error", message: result.message });
      return;
    }

    if (mode === "create") {
      setValues((current) => createEmptyTransactionForm(current.date, current.type));
      setErrors({});
      setFeedback({ kind: "success", message: "Transaksi berhasil disimpan!" });
      titleRef.current?.focus();
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold">Jenis transaksi</legend>
        <div className="grid grid-cols-2 gap-2">
          {TRANSACTION_TYPES.map((type) => {
            const checked = values.type === type;
            const Icon = type === "income" ? ArrowDownLeft : ArrowUpRight;
            return (
              <label
                key={type}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-3 text-sm font-semibold transition-colors has-focus-visible:ring-2 has-focus-visible:ring-primary",
                  checked
                    ? type === "income"
                      ? "border-income bg-income-light text-income"
                      : "border-expense bg-expense-light text-expense"
                    : "border-border text-muted hover:bg-primary-light",
                )}
              >
                <input
                  type="radio"
                  name={`${formId}-type`}
                  value={type}
                  checked={checked}
                  onChange={() => handleTypeChange(type)}
                  className="sr-only"
                />
                <Icon className="size-4" />
                {TRANSACTION_TYPE_LABELS[type]}
              </label>
            );
          })}
        </div>
      </fieldset>

      <Field id={fieldId("title")} label="Nama transaksi" error={errors.title}>
        <TextInput
          ref={titleRef}
          id={fieldId("title")}
          value={values.title}
          maxLength={TITLE_MAX_LENGTH}
          placeholder={values.type === "income" ? "Contoh: Uang saku minggu ini" : "Contoh: Beli bakso"}
          autoComplete="off"
          onChange={(event) => updateField("title", event.target.value)}
          {...fieldA11y(fieldId("title"), errors.title)}
        />
      </Field>

      <Field
        id={fieldId("amount")}
        label="Nominal"
        error={errors.amount}
        hint={amountPreview ? `Tercatat sebagai ${formatRupiah(amountPreview)}` : "Tulis angka saja, contoh: 15000"}
      >
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center font-semibold text-muted">
            Rp
          </span>
          <TextInput
            id={fieldId("amount")}
            inputMode="numeric"
            autoComplete="off"
            placeholder="15.000"
            value={values.amount}
            onChange={(event) => updateField("amount", event.target.value)}
            className="pl-11"
            {...fieldA11y(fieldId("amount"), errors.amount, true)}
          />
        </div>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={fieldId("category")} label="Kategori" error={errors.category}>
          <SelectInput
            id={fieldId("category")}
            value={values.category}
            onChange={(event) => {
              if (isTransactionCategory(event.target.value)) updateField("category", event.target.value);
            }}
            {...fieldA11y(fieldId("category"), errors.category)}
          >
            {TRANSACTION_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </SelectInput>
        </Field>

        <Field id={fieldId("date")} label="Tanggal" error={errors.date}>
          <TextInput
            id={fieldId("date")}
            type="date"
            value={values.date}
            onChange={(event) => updateField("date", event.target.value)}
            {...fieldA11y(fieldId("date"), errors.date)}
          />
        </Field>
      </div>

      <Field id={fieldId("note")} label="Catatan" optional error={errors.note}>
        <TextArea
          id={fieldId("note")}
          rows={2}
          maxLength={NOTE_MAX_LENGTH}
          placeholder="Contoh: Patungan sama teman"
          value={values.note}
          onChange={(event) => updateField("note", event.target.value)}
          {...fieldA11y(fieldId("note"), errors.note)}
        />
      </Field>

      {feedback && <Alert feedback={feedback} onDismiss={() => setFeedback(null)} />}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit">
          <Save className="size-4" />
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}