/**
 * Satu-satunya tempat yang menyentuh window.localStorage.
 * Aman dipanggil saat SSR (mengembalikan "unavailable").
 */
export type ReadStatus = "ok" | "empty" | "recovered" | "unavailable";

export interface ReadResult<T> {
  items: T[];
  status: ReadStatus;
}

const PROBE_KEY = "finpact.__probe__";

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    const storage = window.localStorage;
    storage.setItem(PROBE_KEY, "1");
    storage.removeItem(PROBE_KEY);
    return storage;
  } catch {
    return null; // mode privat, diblokir, atau tidak didukung
  }
}

function backupCorruptValue(storage: Storage, key: string, raw: string): void {
  try {
    storage.setItem(`${key}.backup`, raw);
  } catch {
    // Backup bersifat opsional; abaikan bila kuota penuh.
  }
}

export function writeList<T>(key: string, items: readonly T[]): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(items));
    return true;
  } catch {
    return false; // mis. QuotaExceededError
  }
}

/**
 * Membaca array dari localStorage dan memvalidasi setiap item.
 * Data rusak tidak membuat aplikasi crash: item tidak valid dibuang,
 * nilai mentahnya dicadangkan ke `<key>.backup`, lalu data bersih disimpan ulang.
 */
export function readList<T>(key: string, isItem: (value: unknown) => value is T): ReadResult<T> {
  const storage = getStorage();
  if (!storage) return { items: [], status: "unavailable" };

  const raw = storage.getItem(key);
  if (raw === null) return { items: [], status: "empty" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }

  const items = Array.isArray(parsed) ? parsed.filter(isItem) : [];
  if (Array.isArray(parsed) && items.length === parsed.length) {
    return { items, status: "ok" };
  }

  backupCorruptValue(storage, key, raw);
  writeList(key, items);
  return { items, status: "recovered" };
}