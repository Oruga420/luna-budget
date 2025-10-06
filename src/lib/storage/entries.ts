import type { BudgetEntry, EntrySource, ExpenseType } from "../../domain/types";
import { getBudgetDB } from "./db";
import { createId } from "../utils/id";
import { getMonthKey, normalizeToLocalISODate } from "../utils/date";

export interface EntryInput {
  id?: string;
  itemName: string;
  amount: number;
  currency: string;
  category: string;
  type: ExpenseType;
  source: EntrySource;
  notes?: string | null;
  imageRef?: string | null;
  date: string | Date;
}

export const listEntries = async (): Promise<BudgetEntry[]> => {
  const db = await getBudgetDB();
  return db.getAll("entries");
};

export const listEntriesByMonth = async (
  monthKey: string,
): Promise<BudgetEntry[]> => {
  const db = await getBudgetDB();
  return db.getAllFromIndex("entries", "by-month", monthKey);
};

// Direct put without recalculation (for server sync hydration)
export const putEntry = async (entry: BudgetEntry): Promise<BudgetEntry> => {
  const db = await getBudgetDB();
  await db.put("entries", entry);
  return entry;
};

export const upsertEntry = async (
  input: EntryInput,
): Promise<BudgetEntry> => {
  const db = await getBudgetDB();
  const nowIso = new Date().toISOString();
  const id = input.id ?? createId();
  const dateIso = normalizeToLocalISODate(input.date);
  const monthKey = getMonthKey(dateIso);

  const existing = input.id ? await db.get("entries", id) : null;

  const record: BudgetEntry = {
    id,
    itemName: input.itemName,
    amount: input.amount,
    currency: input.currency,
    category: input.category,
    type: input.type,
    source: input.source,
    notes: input.notes ?? existing?.notes ?? null,
    imageRef: input.imageRef ?? existing?.imageRef ?? null,
    dateIso,
    monthKey,
    createdAt: existing?.createdAt ?? nowIso,
    updatedAt: nowIso,
  };

  await db.put("entries", record);
  return record;
};

export const deleteEntry = async (id: string) => {
  const db = await getBudgetDB();
  await db.delete("entries", id);
};

export const deleteEntriesByMonth = async (monthKey: string) => {
  const db = await getBudgetDB();
  const tx = db.transaction("entries", "readwrite");
  const index = tx.store.index("by-month");
  let cursor = await index.openCursor(monthKey);

  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }

  await tx.done;
};
