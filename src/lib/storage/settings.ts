import type { BudgetSettings } from "../../domain/types";
import { createDefaultSettings } from "../../domain/defaults";
import { getBudgetDB } from "./db";

const SETTINGS_ID = "current";

export const loadSettings = async (): Promise<BudgetSettings> => {
  const db = await getBudgetDB();
  const record = await db.get("settings", SETTINGS_ID);

  if (record) {
    return record;
  }

  const defaults = createDefaultSettings();
  await db.put("settings", defaults);
  return defaults;
};

export const saveSettings = async (
  update: Partial<Omit<BudgetSettings, "id" | "createdAt">> & {
    id?: "current";
  }
): Promise<BudgetSettings> => {
  const db = await getBudgetDB();
  const existing = await db.get("settings", SETTINGS_ID);

  if (!existing) {
    const defaults = createDefaultSettings();
    const next: BudgetSettings = {
      ...defaults,
      ...update,
      updatedAt: new Date().toISOString(),
    };
    await db.put("settings", next);
    return next;
  }

  const next: BudgetSettings = {
    ...existing,
    ...update,
    id: SETTINGS_ID,
    updatedAt: new Date().toISOString(),
  };

  await db.put("settings", next);
  return next;
};

export const resetSettings = async (): Promise<BudgetSettings> => {
  const db = await getBudgetDB();
  const defaults = createDefaultSettings();
  await db.put("settings", defaults);
  return defaults;
};
