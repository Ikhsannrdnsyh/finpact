import { describe, expect, it } from "vitest";
import { calculateGoalProgress } from "@/features/savings/calculations";
import { createEmptySavingsGoalForm, validateSavingsGoalForm } from "@/features/savings/validation";

describe("calculateGoalProgress", () => {
  it("menghitung persentase dan sisa", () => {
    expect(calculateGoalProgress({ targetAmount: 200000, savedAmount: 100000 })).toEqual({
      percent: 50,
      remaining: 100000,
      isComplete: false,
    });
  });

  it("membatasi 100% saat target terlampaui", () => {
    expect(calculateGoalProgress({ targetAmount: 100000, savedAmount: 150000 })).toEqual({
      percent: 100,
      remaining: 0,
      isComplete: true,
    });
  });
});

describe("validateSavingsGoalForm", () => {
  const base = { ...createEmptySavingsGoalForm(), title: "Beli headset" };

  it.each(["0", "-1000", "", "abc"])("menolak target %j", (targetAmount) => {
    expect(validateSavingsGoalForm({ ...base, targetAmount }).ok).toBe(false);
  });

  it("terkumpul kosong dianggap 0", () => {
    const result = validateSavingsGoalForm({ ...base, targetAmount: "250000" });
    expect(result).toEqual({
      ok: true,
      value: { title: "Beli headset", targetAmount: 250000, savedAmount: 0, deadline: undefined },
    });
  });

  it("menolak tenggat tidak valid", () => {
    expect(validateSavingsGoalForm({ ...base, targetAmount: "1000", deadline: "2026-13-40" }).ok).toBe(false);
  });
});