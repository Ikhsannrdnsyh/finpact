import { useSyncExternalStore } from "react";

/** Mengingat bahwa pengguna memilih "Masuk sebagai Tamu" di browser ini. */
const GUEST_MODE_KEY = "finpact.guest-mode.v1";
const listeners = new Set<() => void>();
let memoryFallback = false; // dipakai bila localStorage diblokir (mode privat)

function readGuestMode(): boolean {
  try {
    return window.localStorage.getItem(GUEST_MODE_KEY) === "1" || memoryFallback;
  } catch {
    return memoryFallback;
  }
}

export function setGuestMode(enabled: boolean): void {
  memoryFallback = enabled;
  try {
    if (enabled) window.localStorage.setItem(GUEST_MODE_KEY, "1");
    else window.localStorage.removeItem(GUEST_MODE_KEY);
  } catch {
    // Tetap berjalan dengan fallback memori.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** null = belum diketahui (saat render server). */
export function useGuestMode(): boolean | null {
  return useSyncExternalStore(subscribe, readGuestMode, () => null);
}