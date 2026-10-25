import type { Period, TransactionCategory, TransactionType, TypeFilter } from "@/types/finance";

export const TITLE_MAX_LENGTH = 60;
export const NOTE_MAX_LENGTH = 200;

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  income: "Uang Masuk",
  expense: "Uang Keluar",
};

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  allowance: "Uang saku",
  food: "Makanan & minuman",
  transport: "Transportasi",
  school: "Perlengkapan sekolah",
  entertainment: "Hiburan",
  savings: "Tabungan",
  other: "Lainnya",
};

export const DEFAULT_CATEGORY: Record<TransactionType, TransactionCategory> = {
  income: "allowance",
  expense: "food",
};

export const PERIOD_LABELS: Record<Period, string> = {
  "this-month": "Bulan ini",
  "last-7-days": "7 hari terakhir",
  "last-month": "Bulan lalu",
  all: "Semua waktu",
};

export const TYPE_FILTER_OPTIONS: ReadonlyArray<{ value: TypeFilter; label: string }> = [
  { value: "all", label: "Semua" },
  { value: "income", label: "Masuk" },
  { value: "expense", label: "Keluar" },
];