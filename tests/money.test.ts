import { describe, expect, it } from "vitest";
import { formatRupiah, parseRupiahInput } from "@/lib/money";

describe("formatRupiah", () => {
  it("memformat ke gaya Rp15.000", () => {
    expect(formatRupiah(15000)).toBe("Rp15.000");
    expect(formatRupiah(0)).toBe("Rp0");
  });
});

describe("parseRupiahInput", () => {
  it.each([
    ["15000", 15000],
    ["15.000", 15000],
    ["Rp 15.000", 15000],
    [" 2500 ", 2500],
  ])("menerima %s", (raw, expected) => {
    expect(parseRupiahInput(raw)).toBe(expected);
  });

  it.each(["", "   ", "-5000", "0", "abc", "12,5", "1.2.3", "NaN", "1e5", "Infinity"])(
    "menolak %j",
    (raw) => {
      expect(parseRupiahInput(raw)).toBeNull();
    },
  );

  it("mengizinkan 0 bila diminta", () => {
    expect(parseRupiahInput("0", true)).toBe(0);
  });
});