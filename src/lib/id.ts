export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback untuk konteks non-HTTPS (mis. tes lewat IP lokal di HP)
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}