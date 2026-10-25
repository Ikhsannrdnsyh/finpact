import { describe, expect, it } from "vitest";
import {
  buildChartSeries,
  calculateSummary,
  filterTransactions,
  getPeriodRange,
  sortByNewest,
} from "@/features/transactions/calculations";
import { createEmptyTransactionForm, isTransaction, validateTransactionForm } from "@/features/transactions/validation";
import { makeTransaction } from "./helpers";

const TODAY = "2026-10-25";

describe("calculateSummary", () => {
  it("saldo awal Rp0", () => {
    expect(calculateSummary([]).balance).toBe(0);
  });

  it("pemasukan 50.000 lalu pengeluaran 12.000 menghasilkan 38.000", () => {
    const income = makeTransaction({ type: "income", amount: 50000 });
    expect(calculateSummary([income]).balance).toBe(50000);
    const expense = makeTransaction({ type: "expense", amount: 12000, category: "food" });
    expect(calculateSummary([income, expense])).toMatchObject({ income: 50000, expense: 12000, balance: 38000 });
  });
});

describe("getPeriodRange", () => {
  it("menghitung rentang periode", () => {
    expect(getPeriodRange("this-month", TODAY)).toEqual({ start: "2026-10-01", end: "2026-10-31" });
    expect(getPeriodRange("last-7-days", TODAY)).toEqual({ start: "2026-10-19", end: "2026-10-25" });
    expect(getPeriodRange("last-month", TODAY)).toEqual({ start: "2026-09-01", end: "2026-09-30" });
    expect(getPeriodRange("all", TODAY)).toBeNull();
  });
});

describe("filterTransactions", () => {
  const items = [
    makeTransaction({ title: "Uang saku", type: "income", date: "2026-10-20" }),
    makeTransaction({ title: "Beli bakso", type: "expense", category: "food", date: "2026-10-24" }),
    makeTransaction({ title: "Ongkos angkot", type: "expense", category: "transport", date: "2026-09-10" }),
  ];

  it("filter jenis", () => {
    expect(filterTransactions(items, { type: "expense", today: TODAY })).toHaveLength(2);
    expect(filterTransactions(items, { type: "income", today: TODAY })).toHaveLength(1);
  });

  it("filter periode", () => {
    expect(filterTransactions(items, { period: "this-month", today: TODAY })).toHaveLength(2);
    expect(filterTransactions(items, { period: "last-month", today: TODAY })).toHaveLength(1);
  });

  it("pencarian nama tidak peka huruf besar", () => {
    const result = filterTransactions(items, { query: "BAKSO", today: TODAY });
    expect(result.map((t) => t.title)).toEqual(["Beli bakso"]);
  });
});

describe("sortByNewest", () => {
  it("mengurutkan tanggal terbaru dulu", () => {
    const older = makeTransaction({ date: "2026-10-01" });
    const newer = makeTransaction({ date: "2026-10-22" });
    expect(sortByNewest([older, newer])[0].id).toBe(newer.id);
  });
});

describe("buildChartSeries", () => {
  it("mengelompokkan per hari untuk 7 hari terakhir", () => {
    const series = buildChartSeries(
      [makeTransaction({ type: "expense", amount: 12000, date: TODAY, category: "food" })],
      "last-7-days",
      TODAY,
    );
    expect(series).toHaveLength(7);
    expect(series[6]).toMatchObject({ key: TODAY, expense: 12000, income: 0 });
  });

  it("mengelompokkan per bulan untuk semua waktu", () => {
    const series = buildChartSeries([makeTransaction({ amount: 50000, date: "2026-09-02" })], "all", TODAY);
    expect(series).toHaveLength(6);
    expect(series.find((p) => p.key === "2026-09")?.income).toBe(50000);
  });
});

describe("validateTransactionForm", () => {
  const base = { ...createEmptyTransactionForm(TODAY), title: "Beli bakso" };

  it.each(["", "-5000", "abc", "0"])("menolak nominal %j", (amount) => {
    const result = validateTransactionForm({ ...base, amount });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.amount).toBeDefined();
  });

  it("menolak nama kosong", () => {
    const result = validateTransactionForm({ ...base, title: "   ", amount: "10000" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.title).toBeDefined();
  });

  it("menerima input valid dan merapikan data", () => {
    const result = validateTransactionForm({ ...base, title: "  Beli bakso ", amount: "15.000", note: "  " });
    expect(result).toEqual({
      ok: true,
      value: { type: "expense", title: "Beli bakso", amount: 15000, category: "food", date: TODAY, note: undefined },
    });
  });
});

describe("isTransaction", () => {
  it("menolak data rusak", () => {
    expect(isTransaction(makeTransaction())).toBe(true);
    expect(isTransaction({ ...makeTransaction(), amount: -1 })).toBe(false);
    expect(isTransaction({ ...makeTransaction(), amount: "5000" })).toBe(false);
    expect(isTransaction({ ...makeTransaction(), date: "2026-02-30" })).toBe(false);
    expect(isTransaction(null)).toBe(false);
  });
});