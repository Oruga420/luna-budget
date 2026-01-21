import type { BudgetEntry, FixedExpense } from "../../domain/types";
// import { upsertEntry, type EntryInput } from "../storage/entries";
import type { EntryInput } from "../../domain/types"; // Fallback import

export const buildFixedEntryId = (fixedId: string, monthKey: string) =>
  `fixed-${fixedId}-${monthKey}`;

export const buildFixedExpenseDate = (
  monthKey: string,
  billingDay: number | null,
) => {
  const day = billingDay ?? 1;
  return `${monthKey}-${String(day).padStart(2, "0")}`;
};

export const toEntryInputFromFixed = (
  fixed: FixedExpense,
  monthKey: string,
  currency: string,
): EntryInput => ({
  id: buildFixedEntryId(fixed.id, monthKey),
  itemName: fixed.name,
  amount: fixed.amount,
  currency,
  category: fixed.category,
  type: "fixed",
  source: "manual",
  notes: fixed.notes,
  imageRef: null,
  date: buildFixedExpenseDate(monthKey, fixed.billingDay),
});

export const toBudgetEntryFromFixed = (
  fixed: FixedExpense,
  monthKey: string,
  currency: string,
): BudgetEntry => ({
  id: buildFixedEntryId(fixed.id, monthKey),
  itemName: fixed.name,
  amount: fixed.amount,
  currency,
  category: fixed.category,
  type: "fixed",
  source: "manual",
  notes: fixed.notes ?? null,
  imageRef: null,
  dateIso: buildFixedExpenseDate(monthKey, fixed.billingDay),
  monthKey,
  createdAt: fixed.createdAt,
  updatedAt: fixed.updatedAt,
});

export const injectFixedExpensesForMonth = async ({
  fixedExpenses,
}: {
  fixedExpenses: FixedExpense[];
  monthKey: string;
  currency: string;
}): Promise<BudgetEntry[]> => {
  if (!fixedExpenses.length) {
    return [];
  }

  const results: BudgetEntry[] = [];

  /*
  for (const _fixed of fixedExpenses) {
    // const saved = await upsertEntry(toEntryInputFromFixed(_fixed, monthKey, currency));
    // results.push(saved);
  }
  */
  console.warn("injectFixedExpensesForMonth is temporarily disabled during refactor");

  return results;
};
