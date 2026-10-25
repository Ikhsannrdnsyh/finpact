import { afterEach, describe, expect, it, vi } from "vitest";
import { isTransaction } from "@/features/transactions/validation";
import { readList } from "@/lib/storage/local-storage";
import { MemoryStorage, makeTransaction } from "./helpers";

const KEY = "finpact.transactions.v1";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("readList", () => {
  it("unavailable saat tidak ada window (SSR)", () => {
    expect(readList(KEY, isTransaction).status).toBe("unavailable");
  });

  it("JSON rusak tidak membuat crash dan dicadangkan", () => {
    const storage = new MemoryStorage();
    storage.setItem(KEY, "{bukan json");
    vi.stubGlobal("window", { localStorage: storage });

    expect(readList(KEY, isTransaction)).toEqual({ items: [], status: "recovered" });
    expect(storage.getItem(`${KEY}.backup`)).toBe("{bukan json");
    expect(storage.getItem(KEY)).toBe("[]");
  });

  it("membuang item tidak valid dan mempertahankan yang valid", () => {
    const valid = makeTransaction();
    const storage = new MemoryStorage();
    storage.setItem(KEY, JSON.stringify([valid, { id: "x", amount: "salah" }]));
    vi.stubGlobal("window", { localStorage: storage });

    expect(readList(KEY, isTransaction)).toEqual({ items: [valid], status: "recovered" });
  });
});