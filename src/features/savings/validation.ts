import { isRecord, isTimestamp } from "@/lib/guards";
import { isValidISODate } from "@/lib/dates";
import { formatAmountInput, isValidAmount, parseRupiahInput } from "@/lib/money";
import type { AddFundsInput, SavingsGoal, SavingsGoalInput, ValidationResult } from "@/types/finance";

export const GOAL_TITLE_MAX_LENGTH = 60;

export interface SavingsGoalFormValues {
  title: string;
  targetAmount: string;
  savedAmount: string;
  deadline: string;
}

export type SavingsGoalField = keyof SavingsGoalFormValues;
export type SavingsGoalFormErrors = Partial<Record<SavingsGoalField, string>>;

export function createEmptySavingsGoalForm(): SavingsGoalFormValues {
  return { title: "", targetAmount: "", savedAmount: "", deadline: "" };
}

export function savingsGoalToFormValues(goal: SavingsGoal): SavingsGoalFormValues {
  return {
    title: goal.title,
    targetAmount: formatAmountInput(goal.targetAmount),
    savedAmount: goal.savedAmount > 0 ? formatAmountInput(goal.savedAmount) : "",
    deadline: goal.deadline ?? "",
  };
}

export function validateSavingsGoalForm(
  values: SavingsGoalFormValues,
): ValidationResult<SavingsGoalInput, SavingsGoalField> {
  const errors: SavingsGoalFormErrors = {};

  const title = values.title.trim();
  if (!title) errors.title = "Nama target wajib diisi.";
  else if (title.length > GOAL_TITLE_MAX_LENGTH)
    errors.title = `Nama target maksimal ${GOAL_TITLE_MAX_LENGTH} karakter.`;

  const targetRaw = values.targetAmount.trim();
  const targetAmount = parseRupiahInput(targetRaw);
  if (!targetRaw) errors.targetAmount = "Nominal target wajib diisi.";
  else if (targetAmount === null) errors.targetAmount = "Nominal target harus angka lebih dari 0.";

  const savedRaw = values.savedAmount.trim();
  const savedAmount = savedRaw === "" ? 0 : parseRupiahInput(savedRaw, true);
  if (savedAmount === null) errors.savedAmount = "Nominal terkumpul harus angka 0 atau lebih.";

  const deadline = values.deadline.trim();
  if (deadline && !isValidISODate(deadline)) errors.deadline = "Pilih tanggal tenggat yang valid.";

  if (Object.keys(errors).length > 0 || targetAmount === null || savedAmount === null) {
    return { ok: false, errors };
  }

  return { ok: true, value: { title, targetAmount, savedAmount, deadline: deadline || undefined } };
}

export function isSavingsGoal(value: unknown): value is SavingsGoal {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.title === "string" &&
    value.title.trim().length > 0 &&
    isValidAmount(value.targetAmount) &&
    isValidAmount(value.savedAmount, true) &&
    (value.deadline === undefined || isValidISODate(value.deadline)) &&
    isTimestamp(value.createdAt) &&
    isTimestamp(value.updatedAt)
  );
}

export interface AddFundsFormValues {
  amount: string;
  date: string;
}

export type AddFundsField = keyof AddFundsFormValues;
export type AddFundsFormErrors = Partial<Record<AddFundsField, string>>;

export function validateAddFundsForm(values: AddFundsFormValues): ValidationResult<AddFundsInput, AddFundsField> {
  const errors: AddFundsFormErrors = {};

  const amountRaw = values.amount.trim();
  const amount = parseRupiahInput(amountRaw);
  if (!amountRaw) errors.amount = "Nominal wajib diisi.";
  else if (amount === null) errors.amount = "Nominal harus angka lebih dari 0.";

  if (!isValidISODate(values.date)) errors.date = "Pilih tanggal yang valid.";

  if (Object.keys(errors).length > 0 || amount === null) return { ok: false, errors };
  return { ok: true, value: { amount, date: values.date } };
}