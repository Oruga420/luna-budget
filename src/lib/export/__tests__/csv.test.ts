import { describe, expect, it } from "vitest";
import { buildCsvBlob, buildMonthFilename, serializeEntriesToCsv } from "../csv";
import type { BudgetEntry, BudgetSettings } from "../../../domain/types";

describe("csv helpers", () => {
  const baseSettings: BudgetSettings = {
    id: "current",
    budget: 1000,
    savingsGoal: 200,
    alertThresholdPct: 0.6,
    currency: "MXN",
    categories: ["comida", "renta"],
    createdAt: new Date("2025-01-01T00:00:00Z").toISOString(),
    updatedAt: new Date("2025-01-01T00:00:00Z").toISOString(),
  };

  const baseEntry: BudgetEntry = {
    id: "entry-1",
    itemName: "Super semanal",
    amount: 450.5,
    currency: "MXN",
    category: "comida",
    type: "variable",
    source: "manual",
    notes: "verduras, frutas",
    imageRef: null,
    dateIso: "2025-02-08",
    monthKey: "2025-02",
    createdAt: new Date("2025-02-08T12:00:00Z").toISOString(),
    updatedAt: new Date("2025-02-08T12:00:00Z").toISOString(),
  };

  it("serializes entries with header and escapes content", () => {
    const csv = serializeEntriesToCsv([baseEntry], baseSettings, "2025-02");
    const lines = csv.split("\n");

    expect(lines[0]).toBe(
      "id,date_iso,item_name,amount,currency,category,type,source,notes,image_ref,month_key,budget_month,savings_goal_month",
    );
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain('"verduras, frutas"');
    expect(lines[1]).toContain(",2025-02,");
    expect(lines[1]).toContain(",1000,");
  });

  it("builds csv blobs with the correct mime type", () => {
    const csv = serializeEntriesToCsv([], baseSettings, "2025-02");
    const blob = buildCsvBlob(csv);

    expect(blob.type).toBe("text/csv;charset=utf-8;");
    expect(blob.size).toBeGreaterThan(0);
  });

  it("constructs month filenames", () => {
    expect(buildMonthFilename("2025-02")).toBe("budget-2025-02.csv");
  });
});
