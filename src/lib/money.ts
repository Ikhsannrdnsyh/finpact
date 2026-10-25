export const MAX_AMOUNT = 1_000_000_000_000;

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const plainFormatter = new Intl.NumberFormat("id-ID");
const compactFormatter = new Intl.NumberFormat("id-ID", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** 15000 -> "Rp15.000" */
export function formatRupiah(amount: number): string {
  return rupiahFormatter.format(amount).replace(/\s/g, "");
}

/** 15000 -> "15.000" (untuk mengisi ulang input saat edit) */
export function formatAmountInput(amount: number): string {
  return plainFormatter.format(amount);
}

/** 1500000 -> "1,5 jt" (label sumbu grafik) */
export function formatCompactRupiah(amount: number): string {
  return amount === 0 ? "0" : compactFormatter.format(amount);
}

export function isValidAmount(value: unknown, allowZero = false): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value <= MAX_AMOUNT &&
    (allowZero ? value >= 0 : value > 0)
  );
}

// Angka polos ("15000") atau dengan titik ribuan yang benar ("15.000").
const AMOUNT_PATTERN = /^(\d+|\d{1,3}(\.\d{3})+)$/;

/**
 * Mengubah teks input nominal menjadi angka Rupiah.
 * Menolak kosong, negatif, desimal, notasi ilmiah, dan teks bukan angka.
 */
export function parseRupiahInput(raw: string, allowZero = false): number | null {
  const cleaned = raw.trim().replace(/^rp\.?/i, "").replace(/\s/g, "");
  if (!AMOUNT_PATTERN.test(cleaned)) return null;
  const value = Number(cleaned.replace(/\./g, ""));
  return isValidAmount(value, allowZero) ? value : null;
}