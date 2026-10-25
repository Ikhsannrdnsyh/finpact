import { TITLE_MAX_LENGTH } from "@/features/transactions/constants";

export const GOAL_TRANSFER_NOTE = "Dana disisihkan ke target tabungan.";

export function goalTransferTitle(goalTitle: string): string {
  return `Tabungan: ${goalTitle}`.slice(0, TITLE_MAX_LENGTH);
}