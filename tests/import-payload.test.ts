import { describe, expect, it } from "vitest";
import { buildImportPayload } from "@/data/import-payload";
import type { SavingsGoal } from "@/types/finance";
import { makeTransaction } from "./helpers";

describe("buildImportPayload", () => {
  it("memberi id baru, memetakan goal_id, dan mencegah progres terhitung dua kali", () => {
    let counter = 0;
    const nextId = () => `uuid-${++counter}`;

    const goal: SavingsGoal = {
      id: "local-goal",
      title: "Headset",
      targetAmount: 200000,
      savedAmount: 50000,
      createdAt: "2026-10-01T00:00:00.000Z",
      updatedAt: "2026-10-01T00:00:00.000Z",
    };
    const linked = makeTransaction({ type: "expense", category: "savings", amount: 20000, goalId: "local-goal" });
    const orphan = makeTransaction({ type: "expense", category: "savings", amount: 5000, goalId: "sudah-dihapus" });

    const payload = buildImportPayload([linked, orphan], [goal], nextId);

    // 50.000 - 20.000; database menambahkan 20.000 kembali lewat trigger.
    expect(payload.goals[0]).toMatchObject({ id: "uuid-1", saved_amount: 30000, deadline: null });
    expect(payload.transactions[0]).toMatchObject({ goal_id: "uuid-1", amount: 20000 });
    expect(payload.transactions[1]?.goal_id).toBeNull();
    expect(new Set(payload.transactions.map((t) => t.id)).size).toBe(2);
  });
});