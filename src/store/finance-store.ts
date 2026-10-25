import { FinanceError, getErrorMessage } from "@/data/errors";
import { createLocalRepository } from "@/data/local-repository";
import { createSupabaseRepository } from "@/data/supabase-repository";
import type { FinanceRepository, StorageNotice } from "@/data/types";
import { createClient } from "@/lib/supabase/client";
import type {
  ActionResult,
  AddFundsInput,
  SavingsGoal,
  SavingsGoalInput,
  Transaction,
  TransactionInput,
} from "@/types/finance";

export type { StorageNotice } from "@/data/types";

/**
 * State bersama aplikasi (useSyncExternalStore).
 * - Tamu: data di browser (localStorage).
 * - Sudah masuk: data di Supabase, dipisah per akun oleh RLS.
 * Server & hydration selalu melihat status "loading".
 */
export type DataMode = "guest" | "account";

export interface PendingImport {
  transactions: number;
  goals: number;
}

export interface FinanceSnapshot {
  status: "loading" | "ready" | "error";
  mode: DataMode;
  transactions: readonly Transaction[];
  goals: readonly SavingsGoal[];
  notice: StorageNotice | null;
  loadError: string | null;
  pendingImport: PendingImport | null;
}

const INITIAL_SNAPSHOT: FinanceSnapshot = {
  status: "loading",
  mode: "guest",
  transactions: [],
  goals: [],
  notice: null,
  loadError: null,
  pendingImport: null,
};

const localRepository = createLocalRepository();

let snapshot: FinanceSnapshot = INITIAL_SNAPSHOT;
let repository: FinanceRepository = localRepository;
let startPromise: Promise<void> | null = null;
let loadVersion = 0;
let currentUserId: string | null | undefined;
let importDismissed = false;
const listeners = new Set<() => void>();

function setSnapshot(patch: Partial<FinanceSnapshot>): void {
  snapshot = { ...snapshot, ...patch };
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  void initializeFinanceStore();
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): FinanceSnapshot {
  return snapshot;
}

export function getServerSnapshot(): FinanceSnapshot {
  return INITIAL_SNAPSHOT;
}

async function detectPendingImport(): Promise<PendingImport | null> {
  if (importDismissed) return null;
  const local = await localRepository.load();
  if (local.transactions.length === 0 && local.goals.length === 0) return null;
  return { transactions: local.transactions.length, goals: local.goals.length };
}

async function loadFrom(next: FinanceRepository, mode: DataMode): Promise<void> {
  const version = ++loadVersion;
  repository = next;
  if (snapshot.status !== "loading" || snapshot.mode !== mode) {
    // Kosongkan data lama supaya data akun sebelumnya tidak sempat terlihat.
    setSnapshot({ status: "loading", mode, transactions: [], goals: [], loadError: null, pendingImport: null });
  }

  try {
    const data = await next.load();
    const pendingImport = mode === "account" ? await detectPendingImport() : null;
    if (version !== loadVersion) return;
    setSnapshot({
      status: "ready",
      mode,
      transactions: data.transactions,
      goals: data.goals,
      notice: mode === "guest" ? data.notice : null,
      loadError: null,
      pendingImport,
    });
  } catch (error) {
    if (version !== loadVersion) return;
    setSnapshot({ status: "error", mode, loadError: getErrorMessage(error) });
  }
}

/** Mulai sekali: pilih penyimpanan sesuai status login, lalu ikuti perubahan login/logout. */
export function initializeFinanceStore(): Promise<void> {
  if (startPromise) return startPromise;
  if (typeof window === "undefined") return Promise.resolve();

  const supabase = createClient();
  if (!supabase) {
    startPromise = loadFrom(localRepository, "guest");
    return startPromise;
  }

  startPromise = new Promise<void>((resolve) => {
    supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user.id ?? null;
      if (userId === currentUserId) return; // mis. token diperbarui: bukan ganti akun
      currentUserId = userId;
      // Jangan memanggil Supabase langsung di dalam callback ini (bisa macet); tunda sebentar.
      setTimeout(() => {
        const next = userId ? createSupabaseRepository(supabase) : localRepository;
        void loadFrom(next, userId ? "account" : "guest").finally(resolve);
      }, 0);
    });
  });
  return startPromise;
}

export function reloadFinanceData(): Promise<void> {
  return loadFrom(repository, snapshot.mode);
}

/** Jalankan perubahan, lalu muat ulang data dari sumbernya agar tampilan selalu sesuai. */
async function mutate(operation: (repo: FinanceRepository) => Promise<void>): Promise<ActionResult> {
  await initializeFinanceStore();
  const repo = repository;
  const version = loadVersion;

  try {
    await operation(repo);
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }

  try {
    const data = await repo.load();
    if (version === loadVersion) setSnapshot({ transactions: data.transactions, goals: data.goals });
  } catch {
    if (version === loadVersion) {
      setSnapshot({
        status: "error",
        loadError: "Perubahan sudah tersimpan, tapi data terbaru belum bisa dimuat. Coba muat ulang.",
      });
    }
  }
  return { ok: true };
}

// ---------- Transaksi ----------

export function addTransaction(input: TransactionInput): Promise<ActionResult> {
  return mutate((repo) => repo.addTransaction(input));
}

export function updateTransaction(id: string, input: TransactionInput): Promise<ActionResult> {
  return mutate((repo) => repo.updateTransaction(id, input));
}

export function deleteTransaction(id: string): Promise<ActionResult> {
  return mutate((repo) => repo.deleteTransaction(id));
}

// ---------- Target tabungan ----------

export function addSavingsGoal(input: SavingsGoalInput): Promise<ActionResult> {
  return mutate((repo) => repo.addSavingsGoal(input));
}

export function updateSavingsGoal(id: string, input: SavingsGoalInput): Promise<ActionResult> {
  return mutate((repo) => repo.updateSavingsGoal(id, input));
}

export function deleteSavingsGoal(id: string): Promise<ActionResult> {
  return mutate((repo) => repo.deleteSavingsGoal(id));
}

export function addFundsToGoal(goalId: string, input: AddFundsInput): Promise<ActionResult> {
  const goal = snapshot.goals.find((item) => item.id === goalId);
  if (!goal) return Promise.resolve({ ok: false, message: "Target tidak ditemukan. Mungkin sudah dihapus." });
  return mutate((repo) => repo.addFundsToGoal(goal, input));
}

// ---------- Pindah data browser -> akun ----------

export async function importLocalData(): Promise<ActionResult> {
  const local = await localRepository.load();
  const result = await mutate(async (repo) => {
    if (!repo.importData) throw new FinanceError("Masuk ke akun dulu untuk memindahkan data.");
    await repo.importData(local.transactions, local.goals);
  });
  if (result.ok) {
    localRepository.clear(); // cegah data dipindahkan dua kali
    setSnapshot({ pendingImport: null });
  }
  return result;
}

export function dismissImport(): void {
  importDismissed = true;
  setSnapshot({ pendingImport: null });
}

export function dismissStorageNotice(): void {
  setSnapshot({ notice: null });
}