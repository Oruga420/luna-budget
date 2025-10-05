import { beforeEach, describe, expect, it, vi } from "vitest";

const DB_NAME = "luna-budget-keeper";

const clearBudgetDB = async () =>
  new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  });

describe("settings storage", () => {
  beforeEach(async () => {
    await clearBudgetDB();
    vi.resetModules();
  });

  it("returns default settings when none exist", async () => {
    const { loadSettings } = await import("../settings");

    const settings = await loadSettings();

    expect(settings).toMatchObject({
      id: "current",
      budget: 0,
      savingsGoal: 0,
      alertThresholdPct: 0.5,
      currency: "MXN",
      categories: expect.arrayContaining(["comida", "renta", "otros"]),
    });
  });

  it("persists updates with timestamps", async () => {
    const { loadSettings, saveSettings } = await import("../settings");

    const updated = await saveSettings({
      budget: 1200,
      savingsGoal: 300,
      alertThresholdPct: 0.65,
      currency: "USD",
    });

    expect(updated.budget).toBe(1200);
    expect(updated.savingsGoal).toBe(300);
    expect(updated.alertThresholdPct).toBeCloseTo(0.65);
    expect(updated.currency).toBe("USD");
    expect(updated.updatedAt).not.toBe(updated.createdAt);

    const loaded = await loadSettings();
    expect(loaded).toEqual(updated);
  });
});
