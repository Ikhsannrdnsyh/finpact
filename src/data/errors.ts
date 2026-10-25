export const OFFLINE_MESSAGE = "Tidak bisa terhubung ke server. Periksa koneksi internetmu lalu coba lagi.";

/** Error dengan pesan yang aman & ramah untuk ditampilkan ke siswa. */
export class FinanceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FinanceError";
  }
}

export function notFoundError(label: string): FinanceError {
  return new FinanceError(`${label} tidak ditemukan. Mungkin sudah dihapus.`);
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof FinanceError) return error.message;
  if (error instanceof TypeError) return OFFLINE_MESSAGE; // fetch gagal
  return "Terjadi kesalahan. Coba lagi sebentar lagi.";
}

export function fromSupabaseError(error: { message: string; code?: string }): FinanceError {
  console.error("[FinPact] Supabase error:", error);
  if (/failed to fetch|fetch failed|network/i.test(error.message)) return new FinanceError(OFFLINE_MESSAGE);
  if (error.code === "PGRST301" || /jwt/i.test(error.message)) {
    return new FinanceError("Sesi login berakhir. Silakan keluar lalu masuk lagi.");
  }
  if (error.code === "P0002") return new FinanceError("Target tabungan tidak ditemukan. Mungkin sudah dihapus.");
  return new FinanceError("Server menolak perubahan ini. Coba lagi sebentar lagi.");
}