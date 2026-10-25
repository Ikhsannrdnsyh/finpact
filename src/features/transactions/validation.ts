import { isOneOf, isRecord, isTimestamp } from "@/lib/guards";
import { isValidISODate } from "@/lib/dates";
import { formatAmountInput, isValidAmount, parseRupiahInput } from "@/lib/money";
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_TYPES,
  type Transaction,
  type TransactionCategory,
  type TransactionInput,
  type TransactionType,
  type ValidationResult,
} from "@/types/finance";
import { DEFAULT_CATEGORY, NOTE_MAX_LENGTH, TITLE_MAX_LENGTH } from "./constants";

export interface TransactionFormValues {
  type: TransactionType;
  title: string;
  amount: string;
  category: TransactionCategory;
  date: string;
  note: string;
}

export type TransactionField = keyof TransactionFormValues;
export type TransactionFormErrors = Partial<Record<TransactionField, string>>;

export function createEmptyTransactionForm(
  date: string,
  type: TransactionType = "expense",
): TransactionFormValues {
  return { type, title: "", amount: "", category: DEFAULT_CATEGORY[type], date, note: "" };
}

export function transactionToFormValues(transaction: Transaction): TransactionFormValues {
  return {
    type: transaction.type,
    title: transaction.title,
    amount: formatAmountInput(transaction.amount),
    category: transaction.category,
    date: transaction.date,
    note: transaction.note ?? "",
  };
}

export function isTransactionCategory(value: unknown): value is TransactionCategory {
  return isOneOf(TRANSACTION_CATEGORIES, value);
}

export function validateTransactionForm(
  values: TransactionFormValues,
): ValidationResult<TransactionInput, TransactionField> {
  const errors: TransactionFormErrors = {};

  const title = values.title.trim();
  if (!title) errors.title = "Nama transaksi wajib diisi.";
  else if (title.length > TITLE_MAX_LENGTH)
    errors.title = `Nama transaksi maksimal ${TITLE_MAX_LENGTH} karakter.`;

  const amountRaw = values.amount.trim();
  const amount = parseRupiahInput(amountRaw);
  if (!amountRaw) errors.amount = "Nominal wajib diisi.";
  else if (amount === null)
    errors.amount = "Nominal harus angka lebih dari 0, contoh: 15000 atau 15.000.";

  if (!isOneOf(TRANSACTION_TYPES, values.type)) errors.type = "Pilih jenis transaksi.";
  if (!isTransactionCategory(values.category)) errors.category = "Pilih kategori.";
  if (!isValidISODate(values.date)) errors.date = "Pilih tanggal yang valid.";

  const note = values.note.trim();
  if (note.length > NOTE_MAX_LENGTH) errors.note = `Catatan maksimal ${NOTE_MAX_LENGTH} karakter.`;

  if (Object.keys(errors).length > 0 || amount === null) return { ok: false, errors };

  return {
    ok: true,
    value: {
      type: values.type,
      title,
      amount,
      category: values.category,
      date: values.date,
      note: note || undefined,
    },
  };
}

/** Validasi data yang dimuat dari localStorage. */
export function isTransaction(value: unknown): value is Transaction {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    isOneOf(TRANSACTION_TYPES, value.type) &&
    typeof value.title === "string" &&
    value.title.trim().length > 0 &&
    isValidAmount(value.amount) &&
    isTransactionCategory(value.category) &&
    isValidISODate(value.date) &&
    (value.note === undefined || typeof value.note === "string") &&
    (value.goalId === undefined || typeof value.goalId === "string") &&
    isTimestamp(value.createdAt) &&
    isTimestamp(value.updatedAt)
  );
}