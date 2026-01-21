'use server';

import { db } from '@/lib/db';
import { settings, entries, fixedExpenses } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireUser } from '@/lib/auth';
import type { BudgetSettings, BudgetEntry, FixedExpense, EntryInput, FixedExpenseInput } from '@/domain/types';

import { getMonthKey, normalizeToLocalISODate } from '@/lib/utils/date';
import { createDefaultSettings } from '@/domain/defaults';

// --- Helpers ---
function normalizeSettings(row: typeof settings.$inferSelect): BudgetSettings {
  return {
    id: "current", // Front-end uses "current" singleton ID
    budget: parseFloat(row.budget as unknown as string),
    savingsGoal: parseFloat(row.savingsGoal as unknown as string),
    alertThresholdPct: parseFloat(row.alertThresholdPct as unknown as string),
    currency: row.currency,
    categories: row.categories || [],
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
    // lastRolledMonthKey logic if needed, currently not in DB schema but in types
    lastRolledMonthKey: getMonthKey(new Date()) 
  };
}

function normalizeEntry(row: typeof entries.$inferSelect): BudgetEntry {
  return {
    id: row.id,
    itemName: row.itemName,
    amount: parseFloat(row.amount as unknown as string),
    currency: row.currency,
    category: row.category,
    type: row.type as "fixed" | "variable",
    dateIso: row.dateIso,
    notes: row.notes,
    source: (row.source as "manual" | "image") ?? "manual",
    imageRef: row.imageRef,
    monthKey: row.monthKey,
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}

function normalizeFixedExpense(row: typeof fixedExpenses.$inferSelect): FixedExpense {
  return {
    id: row.id,
    name: row.name,
    amount: parseFloat(row.amount as unknown as string),
    category: row.category,
    billingDay: row.billingDay,
    notes: row.notes ?? "",
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}

// --- Settings ---

export async function getSettingsAction(): Promise<BudgetSettings> {
  const userId = await requireUser();
  const rows = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1);

  if (rows.length > 0) {
    return normalizeSettings(rows[0]);
  }

  // Create default settings if none exist
  const defaults = createDefaultSettings();
  const [newSettings] = await db.insert(settings).values({
    userId,
    budget: defaults.budget.toString(),
    savingsGoal: defaults.savingsGoal.toString(),
    alertThresholdPct: defaults.alertThresholdPct.toString(),
    currency: defaults.currency,
    categories: defaults.categories,
  }).returning();

  return normalizeSettings(newSettings);
}

export async function updateSettingsAction(updates: Partial<BudgetSettings>): Promise<BudgetSettings> {
  const userId = await requireUser();
  
  // First ensure settings exist
  const existing = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1);
  
  const valuesToUpdate: Record<string, string | string[] | Date> = { updatedAt: new Date() };
  if (updates.budget !== undefined) valuesToUpdate.budget = updates.budget.toString();
  if (updates.savingsGoal !== undefined) valuesToUpdate.savingsGoal = updates.savingsGoal.toString();
  if (updates.alertThresholdPct !== undefined) valuesToUpdate.alertThresholdPct = updates.alertThresholdPct.toString();
  if (updates.currency !== undefined) valuesToUpdate.currency = updates.currency;
  if (updates.categories !== undefined) valuesToUpdate.categories = updates.categories;

  let result;
  if (existing.length === 0) {
    const defaults = createDefaultSettings();
    result = await db.insert(settings).values({
      userId,
      budget: (updates.budget ?? defaults.budget).toString(),
      savingsGoal: (updates.savingsGoal ?? defaults.savingsGoal).toString(),
      alertThresholdPct: (updates.alertThresholdPct ?? defaults.alertThresholdPct).toString(),
      currency: updates.currency ?? defaults.currency,
      categories: updates.categories ?? defaults.categories,
    }).returning();
  } else {
    result = await db.update(settings)
      .set(valuesToUpdate)
      .where(eq(settings.userId, userId))
      .returning();
  }

  return normalizeSettings(result[0]);
}

// --- Entries ---

export async function getEntriesAction(monthKey: string): Promise<BudgetEntry[]> {
  const userId = await requireUser();
  const rows = await db.select().from(entries)
    .where(and(eq(entries.userId, userId), eq(entries.monthKey, monthKey)))
    .orderBy(desc(entries.dateIso), desc(entries.createdAt));

  return rows.map(normalizeEntry);
}

export async function addEntryAction(input: EntryInput): Promise<BudgetEntry> {
  const userId = await requireUser();
  const dateIso = normalizeToLocalISODate(input.date);
  const monthKey = getMonthKey(dateIso);
  
  // If input.id is provided, check if it exists (upsert logic), but normally add is create
  // We'll treat this as upsert to match previous logic
  if (input.id) {
    const existing = await db.select().from(entries).where(and(eq(entries.id, input.id), eq(entries.userId, userId)));
    if (existing.length > 0) {
        return updateEntryAction(input);
    }
  }

  const [row] = await db.insert(entries).values({
    userId,
    itemName: input.itemName,
    amount: input.amount.toString(),
    currency: input.currency,
    category: input.category,
    type: input.type,
    dateIso,
    monthKey,
    notes: input.notes,
    source: input.source,
    imageRef: input.imageRef,
  }).returning();

  return normalizeEntry(row);
}

export async function updateEntryAction(input: EntryInput): Promise<BudgetEntry> {
  const userId = await requireUser();
  if (!input.id) throw new Error("ID required for update");
  
  const dateIso = normalizeToLocalISODate(input.date);
  const monthKey = getMonthKey(dateIso);

  const [row] = await db.update(entries).set({
    itemName: input.itemName,
    amount: input.amount.toString(),
    currency: input.currency,
    category: input.category,
    type: input.type,
    dateIso,
    monthKey,
    notes: input.notes,
    source: input.source,
    imageRef: input.imageRef,
    updatedAt: new Date(),
  }).where(and(eq(entries.id, input.id), eq(entries.userId, userId)))
  .returning();
  
  return normalizeEntry(row);
}

export async function deleteEntryAction(id: string): Promise<void> {
  const userId = await requireUser();
  await db.delete(entries).where(and(eq(entries.id, id), eq(entries.userId, userId)));
}

// --- Fixed Expenses ---

export async function getFixedExpensesAction(): Promise<FixedExpense[]> {
  const userId = await requireUser();
  const rows = await db.select().from(fixedExpenses).where(eq(fixedExpenses.userId, userId));
  return rows.map(normalizeFixedExpense);
}

export async function upsertFixedExpenseAction(input: FixedExpenseInput): Promise<FixedExpense> {
  const userId = await requireUser();
  const currency = input.currency || 'CAD'; // Default to CAD if not provided

  if (input.id) {
    const existing = await db.select().from(fixedExpenses).where(and(eq(fixedExpenses.id, input.id), eq(fixedExpenses.userId, userId)));
    if (existing.length > 0) {
       const [updated] = await db.update(fixedExpenses).set({
         name: input.name,
         amount: input.amount.toString(),
         currency: currency,
         category: input.category,
         billingDay: input.billingDay,
         notes: input.notes,
         updatedAt: new Date(),
       }).where(and(eq(fixedExpenses.id, input.id), eq(fixedExpenses.userId, userId)))
       .returning();
       return normalizeFixedExpense(updated);
    }
  }

  const [row] = await db.insert(fixedExpenses).values({
    userId,
    name: input.name,
    amount: input.amount.toString(),
    currency: currency,
    category: input.category,
    billingDay: input.billingDay,
    notes: input.notes,
  }).returning();

  return normalizeFixedExpense(row);
}


export async function deleteFixedExpenseAction(id: string): Promise<void> {
  const userId = await requireUser();
  await db.delete(fixedExpenses).where(and(eq(fixedExpenses.id, id), eq(fixedExpenses.userId, userId)));
}

// --- Categories ---

export async function addCategoryAction(name: string): Promise<BudgetSettings> {
  const userId = await requireUser();
  const settingsRow = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1);
  if (settingsRow.length === 0) return getSettingsAction();

  const currentCategories = settingsRow[0].categories || [];
  if (currentCategories.some(c => c.toLowerCase() === name.trim().toLowerCase())) {
     throw new Error("Category already exists");
  }
  
  const nextCategories = [...currentCategories, name.trim()];
  
  const [updated] = await db.update(settings).set({
    categories: nextCategories,
    updatedAt: new Date(),
  }).where(eq(settings.userId, userId)).returning();

  return normalizeSettings(updated);
}

export async function renameCategoryAction(current: string, next: string): Promise<BudgetSettings> {
  const userId = await requireUser();
  const settingsRow = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1);
  if (settingsRow.length === 0) return getSettingsAction();
  
  const currentCategories = settingsRow[0].categories || [];
  const normalizedNext = next.trim();
  const normalizedCurrent = current.trim();
  
  // Update Settings
  const nextCategories = currentCategories.map(c => c === current ? normalizedNext : c);
  
  await db.transaction(async (tx) => {
    await tx.update(settings).set({
      categories: nextCategories,
      updatedAt: new Date(),
    }).where(eq(settings.userId, userId));
    
    // Update Entries
    await tx.update(entries).set({
      category: normalizedNext,
      updatedAt: new Date(),
    }).where(and(eq(entries.userId, userId), eq(entries.category, normalizedCurrent)));

    // Update Fixed Expenses
    await tx.update(fixedExpenses).set({
      category: normalizedNext,
      updatedAt: new Date(),
    }).where(and(eq(fixedExpenses.userId, userId), eq(fixedExpenses.category, normalizedCurrent)));
  });

  return getSettingsAction();
}

export async function removeCategoryAction(target: string, fallback: string): Promise<BudgetSettings> {
   const userId = await requireUser();
   const settingsRow = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1);
   if (settingsRow.length === 0) return getSettingsAction();
   
   const currentCategories = settingsRow[0].categories || [];
   if (currentCategories.length <= 1) throw new Error("Must keep at least one category");
   
   const targetName = target.trim();
   const fallbackName = fallback.trim();
   
   const nextCategories = currentCategories.filter(c => c !== targetName);
   if (!nextCategories.includes(fallbackName)) {
      nextCategories.push(fallbackName);
   }

   await db.transaction(async (tx) => {
     await tx.update(settings).set({
       categories: nextCategories,
       updatedAt: new Date(),
     }).where(eq(settings.userId, userId));

     // Update Entries
     await tx.update(entries).set({
       category: fallbackName,
       updatedAt: new Date(),
     }).where(and(eq(entries.userId, userId), eq(entries.category, targetName)));

     // Update Fixed Expenses
     await tx.update(fixedExpenses).set({
       category: fallbackName,
       updatedAt: new Date(),
     }).where(and(eq(fixedExpenses.userId, userId), eq(fixedExpenses.category, targetName)));
   });

   return getSettingsAction();
}

export async function injectFixedExpensesAction(monthKey: string): Promise<BudgetEntry[]> {
  const userId = await requireUser();

  const allFixed = await db.select().from(fixedExpenses).where(eq(fixedExpenses.userId, userId));
  if (allFixed.length === 0) return [];

  const existingEntries = await db.select().from(entries)
    .where(and(
      eq(entries.userId, userId),
      eq(entries.monthKey, monthKey),
      eq(entries.type, 'fixed')
    ));

  const existingNames = new Set(existingEntries.map(e => e.itemName.toLowerCase().trim()));
  const results: BudgetEntry[] = [];

  for (const fixed of allFixed) {
    if (existingNames.has(fixed.name.toLowerCase().trim())) {
      continue;
    }

    const day = fixed.billingDay ?? 1;
    const dateStr = `${monthKey}-${String(day).padStart(2, '0')}`;

    // Re-use addEntryAction to ensure consistent ID/Date handling
    const newEntry = await addEntryAction({
      itemName: fixed.name,
      amount: parseFloat(fixed.amount as unknown as string),
      currency: fixed.currency,
      category: fixed.category,
      type: 'fixed',
      source: 'manual', 
      date: dateStr,
      notes: fixed.notes,
    });
    results.push(newEntry);
  }

  return results;
}

