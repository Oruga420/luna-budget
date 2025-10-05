export type ExpenseType = "fixed" | "variable";
export type EntrySource = "manual" | "image";

export interface BudgetSettings {
  id: "current";
  budget: number;
  savingsGoal: number;
  alertThresholdPct: number;
  currency: string;
  categories: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BudgetEntry {
  id: string;
  itemName: string;
  amount: number;
  currency: string;
  category: string;
  type: ExpenseType;
  source: EntrySource;
  notes: string | null;
  imageRef: string | null;
  dateIso: string;
  monthKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
  billingDay: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ArchiveMetadata {
  monthKey: string;
  filename: string;
  bytes: number;
  checksum: string;
  createdAt: string;
}

export interface StoredImage {
  id: string;
  blob: Blob;
  createdAt: string;
  expiresAt: string | null;
}
