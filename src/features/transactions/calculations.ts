import {
  addDays,
  addMonths,
  endOfMonth,
  formatMonthLabel,
  formatShortDate,
  startOfMonth,
  todayISO,
} from "@/lib/dates";
import type { Period, Transaction, TypeFilter } from "@/types/finance";

export interface TransactionSummary {
  income: number;
  expense: number;
  balance: number;
  count: number;
}

/** Satu-satunya tempat perhitungan saldo: pemasukan − pengeluaran. */
export function calculateSummary(transactions: readonly Transaction[]): TransactionSummary {
  let income = 0;
  let expense = 0;
  for (const transaction of transactions) {
    if (transaction.type === "income") income += transaction.amount;
    else expense += transaction.amount;
  }
  return { income, expense, balance: income - expense, count: transactions.length };
}

export interface DateRange {
  start: string;
  end: string;
}

export function getPeriodRange(period: Period, today: string): DateRange | null {
  switch (period) {
    case "all":
      return null;
    case "last-7-days":
      return { start: addDays(today, -6), end: today };
    case "this-month":
      return { start: startOfMonth(today), end: endOfMonth(today) };
    case "last-month": {
      const lastDayOfPreviousMonth = addDays(startOfMonth(today), -1);
      return { start: startOfMonth(lastDayOfPreviousMonth), end: lastDayOfPreviousMonth };
    }
  }
}

export interface TransactionFilters {
  type?: TypeFilter;
  period?: Period;
  query?: string;
  today?: string;
}

function normalizeText(text: string): string {
  return text.trim().toLocaleLowerCase("id-ID");
}

export function filterTransactions(
  transactions: readonly Transaction[],
  { type = "all", period = "all", query = "", today = todayISO() }: TransactionFilters = {},
): Transaction[] {
  const range = getPeriodRange(period, today);
  const search = normalizeText(query);

  return transactions.filter(
    (transaction) =>
      (type === "all" || transaction.type === type) &&
      (!range || (transaction.date >= range.start && transaction.date <= range.end)) &&
      (!search || normalizeText(transaction.title).includes(search)),
  );
}

/** Terbaru lebih dulu: berdasarkan tanggal, lalu waktu dibuat. */
export function sortByNewest(transactions: readonly Transaction[]): Transaction[] {
  return [...transactions].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  );
}

export interface ChartPoint {
  key: string;
  label: string;
  income: number;
  expense: number;
}

const MONTHS_FOR_ALL_TIME = 6;

/** Data grafik: harian untuk periode berjangka, bulanan (6 bulan terakhir) untuk "Semua waktu". */
export function buildChartSeries(
  transactions: readonly Transaction[],
  period: Period,
  today: string,
): ChartPoint[] {
  const range = getPeriodRange(period, today);
  const points: ChartPoint[] = [];

  if (range) {
    for (let day = range.start; day <= range.end; day = addDays(day, 1)) {
      points.push({ key: day, label: formatShortDate(day), income: 0, expense: 0 });
    }
  } else {
    for (let offset = MONTHS_FOR_ALL_TIME - 1; offset >= 0; offset -= 1) {
      const monthKey = addMonths(today, -offset).slice(0, 7);
      points.push({ key: monthKey, label: formatMonthLabel(monthKey), income: 0, expense: 0 });
    }
  }

  const pointByKey = new Map(points.map((point) => [point.key, point]));
  for (const transaction of transactions) {
    const key = range ? transaction.date : transaction.date.slice(0, 7);
    const point = pointByKey.get(key);
    if (point) point[transaction.type] += transaction.amount;
  }
  return points;
}