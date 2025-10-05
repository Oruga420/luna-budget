import { openDB, type IDBPDatabase, type DBSchema } from "idb";
import type {
  ArchiveMetadata,
  BudgetEntry,
  BudgetSettings,
  FixedExpense,
  StoredImage,
} from "../../domain/types";

const DB_NAME = "luna-budget-keeper";
const DB_VERSION = 1;

interface BudgetDBSchema extends DBSchema {
  settings: {
    key: string;
    value: BudgetSettings;
  };
  entries: {
    key: string;
    value: BudgetEntry;
    indexes: {
      "by-month": string;
    };
  };
  fixedExpenses: {
    key: string;
    value: FixedExpense;
    indexes: {
      "by-category": string;
    };
  };
  archives: {
    key: string;
    value: ArchiveMetadata;
  };
  images: {
    key: string;
    value: StoredImage;
  };
}

let dbPromise: Promise<IDBPDatabase<BudgetDBSchema>> | null = null;

const ensureStores = (db: IDBPDatabase<BudgetDBSchema>) => {
  if (!db.objectStoreNames.contains("settings")) {
    db.createObjectStore("settings", { keyPath: "id" });
  }

  if (!db.objectStoreNames.contains("entries")) {
    const store = db.createObjectStore("entries", {
      keyPath: "id",
    });
    store.createIndex("by-month", "monthKey", { unique: false });
  }

  if (!db.objectStoreNames.contains("fixedExpenses")) {
    const store = db.createObjectStore("fixedExpenses", {
      keyPath: "id",
    });
    store.createIndex("by-category", "category", { unique: false });
  }

  if (!db.objectStoreNames.contains("archives")) {
    db.createObjectStore("archives", { keyPath: "monthKey" });
  }

  if (!db.objectStoreNames.contains("images")) {
    db.createObjectStore("images", { keyPath: "id" });
  }
};

export const getBudgetDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB<BudgetDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        ensureStores(db);
      },
    });
  }

  return dbPromise;
};

export type { BudgetDBSchema };
