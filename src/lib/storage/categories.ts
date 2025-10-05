import type { IDBPObjectStore } from "idb";
import type { BudgetEntry, BudgetSettings, FixedExpense } from "../../domain/types";
import { createDefaultSettings } from "../../domain/defaults";
import { getBudgetDB, type BudgetDBSchema } from "./db";

const SETTINGS_ID = "current";

const normalize = (value: string) => value.trim();
const toKey = (value: string) => normalize(value).toLocaleLowerCase();

const ensureSettingsRecord = async () => {
  const db = await getBudgetDB();
  const existing = await db.get("settings", SETTINGS_ID);

  if (existing) {
    return { db, settings: existing } as const;
  }

  const defaults = createDefaultSettings();
  await db.put("settings", defaults);
  return { db, settings: defaults } as const;
};

const assertNonEmpty = (value: string) => {
  if (!normalize(value)) {
    throw new Error("El nombre de la categoria no puede estar vacio");
  }
};

export const addCategory = async (name: string): Promise<BudgetSettings> => {
  assertNonEmpty(name);
  const cleaned = normalize(name);
  const key = toKey(cleaned);
  const { db, settings } = await ensureSettingsRecord();

  if (settings.categories.some((item) => toKey(item) === key)) {
    throw new Error("Ya existe una categoria con ese nombre");
  }

  const next: BudgetSettings = {
    ...settings,
    categories: [...settings.categories, cleaned],
    updatedAt: new Date().toISOString(),
  };

  await db.put("settings", next);
  return next;
};

const updateEntriesCategory = async (
  entriesStore: IDBPObjectStore<BudgetDBSchema, ["settings", "entries", "fixedExpenses"], "entries">,
  currentKey: string,
  nextName: string,
  timestamp: string,
) => {
  let cursor = await entriesStore.openCursor();
  while (cursor) {
    const value = cursor.value as BudgetEntry;
    if (toKey(value.category) === currentKey) {
      await cursor.update?.({
        ...value,
        category: nextName,
        updatedAt: timestamp,
      });
    }
    cursor = await cursor.continue();
  }
};

const updateFixedExpensesCategory = async (
  fixedStore: IDBPObjectStore<BudgetDBSchema, ["settings", "entries", "fixedExpenses"], "fixedExpenses">,
  currentKey: string,
  nextName: string,
  timestamp: string,
) => {
  let cursor = await fixedStore.openCursor();
  while (cursor) {
    const value = cursor.value as FixedExpense;
    if (toKey(value.category) === currentKey) {
      await cursor.update?.({
        ...value,
        category: nextName,
        updatedAt: timestamp,
      });
    }
    cursor = await cursor.continue();
  }
};

export const renameCategory = async (
  current: string,
  next: string,
): Promise<BudgetSettings> => {
  assertNonEmpty(current);
  assertNonEmpty(next);

  const currentKey = toKey(current);
  const nextName = normalize(next);
  const nextKey = toKey(nextName);

  const { db, settings } = await ensureSettingsRecord();

  if (!settings.categories.some((item) => toKey(item) === currentKey)) {
    throw new Error("La categoria a renombrar no existe");
  }

  if (
    settings.categories.some(
      (item) => toKey(item) === nextKey && toKey(item) !== currentKey,
    )
  ) {
    throw new Error("Ya existe una categoria con ese nombre");
  }

  const tx = db.transaction(["settings", "entries", "fixedExpenses"], "readwrite");
  const settingsStore = tx.objectStore("settings");
  const entriesStore = tx.objectStore("entries");
  const fixedStore = tx.objectStore("fixedExpenses");

  const timestamp = new Date().toISOString();

  const targetSettings = (await settingsStore.get(SETTINGS_ID)) ?? settings;

  const updatedSettings: BudgetSettings = {
    ...targetSettings,
    categories: targetSettings.categories.map((item) =>
      toKey(item) === currentKey ? nextName : item,
    ),
    updatedAt: timestamp,
  };

  await settingsStore.put(updatedSettings);
  await updateEntriesCategory(entriesStore, currentKey, nextName, timestamp);
  await updateFixedExpensesCategory(fixedStore, currentKey, nextName, timestamp);

  await tx.done;
  return updatedSettings;
};

export const removeCategory = async (
  target: string,
  fallback: string,
): Promise<BudgetSettings> => {
  assertNonEmpty(target);
  assertNonEmpty(fallback);

  const targetKey = toKey(target);
  const fallbackName = normalize(fallback);
  const fallbackKey = toKey(fallbackName);

  if (targetKey === fallbackKey) {
    throw new Error("Selecciona una categoria alternativa diferente");
  }

  const { db, settings } = await ensureSettingsRecord();

  if (settings.categories.length <= 1) {
    throw new Error("Debes conservar al menos una categoria");
  }

  if (!settings.categories.some((item) => toKey(item) === targetKey)) {
    throw new Error("La categoria a eliminar no existe");
  }

  const tx = db.transaction(["settings", "entries", "fixedExpenses"], "readwrite");
  const settingsStore = tx.objectStore("settings");
  const entriesStore = tx.objectStore("entries");
  const fixedStore = tx.objectStore("fixedExpenses");

  const timestamp = new Date().toISOString();

  const targetSettings = (await settingsStore.get(SETTINGS_ID)) ?? settings;

  const filteredCategories = targetSettings.categories.filter(
    (item) => toKey(item) !== targetKey,
  );

  if (!filteredCategories.length) {
    throw new Error("Debes conservar al menos una categoria");
  }

  if (!filteredCategories.some((item) => toKey(item) === fallbackKey)) {
    filteredCategories.push(fallbackName);
  }

  const updatedSettings: BudgetSettings = {
    ...targetSettings,
    categories: filteredCategories,
    updatedAt: timestamp,
  };

  await settingsStore.put(updatedSettings);
  await updateEntriesCategory(entriesStore, targetKey, fallbackName, timestamp);
  await updateFixedExpensesCategory(fixedStore, targetKey, fallbackName, timestamp);

  await tx.done;
  return updatedSettings;
};
