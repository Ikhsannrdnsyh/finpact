export const MIN_PASSWORD_LENGTH = 8;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Email atau kata sandi salah.",
  email_not_confirmed: "Email belum dikonfirmasi. Cek kotak masuk (atau folder spam) emailmu.",
  user_already_exists: "Email ini sudah terdaftar. Coba masuk.",
  weak_password: `Kata sandi terlalu lemah. Gunakan minimal ${MIN_PASSWORD_LENGTH} karakter.`,
  same_password: "Kata sandi baru harus berbeda dari yang lama.",
  over_email_send_rate_limit: "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.",
  over_request_rate_limit: "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.",
};

export function getAuthErrorMessage(error: { code?: string } | null): string {
  return (error?.code && AUTH_ERROR_MESSAGES[error.code]) || "Terjadi kesalahan. Coba lagi sebentar lagi.";
}