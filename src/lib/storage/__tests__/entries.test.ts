import { beforeEach, describe, expect, it, vi } from "vitest";

const DB_NAME = "luna-budget-keeper";

const clearBudgetDB = async () =>
  new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  });

describe("entries storage", () => {
  beforeEach(async () => {
    await clearBudgetDB();
    vi.resetModules();
  });

  it("normalizes dates and preserves createdAt on update", async () => {
    const storage = await import("../entries");
    const input = {
      itemName: "Cafe americano",
      amount: 55,
      currency: "MXN",
      category: "comida",
      type: "variable" as const,
      source: "manual" as const,
      date: "2025-03-05",
      notes: "Desayuno",
    };

    const created = await storage.upsertEntry(input);

    expect(created.dateIso).toBe("2025-03-05");
    expect(created.monthKey).toBe("2025-03");
    expect(created.createdAt).toBeDefined();

    const updated = await storage.upsertEntry({
      ...input,
      id: created.id,
      amount: 60,
      notes: "Refill",
    });

    expect(updated.amount).toBe(60);
    expect(updated.notes).toBe("Refill");
    expect(updated.createdAt).toBe(created.createdAt);
    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(created.updatedAt).getTime(),
    );
  });

  it("filters cursor deletions by month", async () => {
    const storage = await import("../entries");

    await storage.upsertEntry({
      itemName: "Renta",
      amount: 700,
      currency: "MXN",
      category: "renta",
      type: "fixed",
      source: "manual",
      date: "2025-02-01",
    });

    await storage.upsertEntry({
      itemName: "Super",
      amount: 90,
      currency: "MXN",
      category: "comida",
      type: "variable",
      source: "manual",
      date: "2025-02-15",
    });

    await storage.upsertEntry({
      itemName: "Gasolina",
      amount: 60,
      currency: "MXN",
      category: "transporte",
      type: "variable",
      source: "manual",
      date: "2025-03-03",
    });

    const febBefore = await storage.listEntriesByMonth("2025-02");
    expect(febBefore).toHaveLength(2);

    await storage.deleteEntriesByMonth("2025-02");

    const febAfter = await storage.listEntriesByMonth("2025-02");
    expect(febAfter).toHaveLength(0);

    const marchEntries = await storage.listEntriesByMonth("2025-03");
    expect(marchEntries).toHaveLength(1);
  });
});

