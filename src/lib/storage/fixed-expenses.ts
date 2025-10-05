import type { FixedExpense } from "../../domain/types";
import { getBudgetDB } from "./db";
import { createId } from "../utils/id";

export interface FixedExpenseInput {
  id?: string;
  name: string;
  amount: number;
  category: string;
  billingDay?: number | null;
  notes?: string | null;
}

const sanitizeBillingDay = (billingDay?: number | null) => {
  if (billingDay === null || typeof billingDay === "undefined") {
    return null;
  }

  const clamped = Math.max(1, Math.min(31, Math.trunc(billingDay)));
  return clamped;
};

export const listFixedExpenses = async (): Promise<FixedExpense[]> => {
  const db = await getBudgetDB();
  return db.getAll("fixedExpenses");
};

export const upsertFixedExpense = async (
  input: FixedExpenseInput,
): Promise<FixedExpense> => {
  const db = await getBudgetDB();
  const nowIso = new Date().toISOString();
  const id = input.id ?? createId();
  const existing = input.id ? await db.get("fixedExpenses", id) : null;

  const record: FixedExpense = {
    id,
    name: input.name,
    amount: input.amount,
    category: input.category,
    billingDay: sanitizeBillingDay(input.billingDay ?? existing?.billingDay ?? null),
    notes: input.notes ?? existing?.notes ?? null,
    createdAt: existing?.createdAt ?? nowIso,
    updatedAt: nowIso,
  };

  await db.put("fixedExpenses", record);
  return record;
};

export const deleteFixedExpense = async (id: string) => {
  const db = await getBudgetDB();
  await db.delete("fixedExpenses", id);
};

export const listFixedExpensesByCategory = async (
  category: string,
): Promise<FixedExpense[]> => {
  const db = await getBudgetDB();
  return db.getAllFromIndex("fixedExpenses", "by-category", category);
};
