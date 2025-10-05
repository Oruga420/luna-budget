import type { BudgetEntry, BudgetSettings } from "../../domain/types";

const HEADER = [
  "id",
  "date_iso",
  "item_name",
  "amount",
  "currency",
  "category",
  "type",
  "source",
  "notes",
  "image_ref",
  "month_key",
  "budget_month",
  "savings_goal_month",
] as const;

type CsvValue = string | number | null;

const escapeValue = (value: CsvValue): string => {
  if (value === null || typeof value === "undefined") {
    return "";
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "";
  }

  const stringValue = String(value);
  if (/([",\n])/u.test(stringValue)) {
    return `"${stringValue.replace(/"/gu, '""')}"`;
  }

  return stringValue;
};

export const serializeEntriesToCsv = (
  entries: BudgetEntry[],
  settings: BudgetSettings,
  monthKey: string,
) => {
  const rows = entries.map((entry) =>
    [
      entry.id,
      entry.dateIso,
      entry.itemName,
      entry.amount,
      entry.currency,
      entry.category,
      entry.type,
      entry.source,
      entry.notes,
      entry.imageRef,
      monthKey,
      settings.budget,
      settings.savingsGoal,
    ].map(escapeValue).join(","),
  );

  return [HEADER.join(","), ...rows].join("\n");
};

export const buildCsvBlob = (csv: string) =>
  new Blob([csv], { type: "text/csv;charset=utf-8;" });

export const buildMonthFilename = (monthKey: string) => `budget-${monthKey}.csv`;

