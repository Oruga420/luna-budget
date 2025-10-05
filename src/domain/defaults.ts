import type { BudgetSettings } from "./types";

export const DEFAULT_CATEGORIES: string[] = [
  "renta",
  "internet",
  "celular",
  "comida",
  "transporte",
  "entretenimiento",
  "weed",
  "membresias",
  "otros",
];

export const DEFAULT_CURRENCY = "MXN";
export const DEFAULT_ALERT_THRESHOLD = 0.5;
export const DEFAULT_BUDGET = 0;
export const DEFAULT_SAVINGS_GOAL = 0;

export const createDefaultSettings = (): BudgetSettings => {
  const now = new Date().toISOString();
  return {
    id: "current",
    budget: DEFAULT_BUDGET,
    savingsGoal: DEFAULT_SAVINGS_GOAL,
    alertThresholdPct: DEFAULT_ALERT_THRESHOLD,
    currency: DEFAULT_CURRENCY,
    categories: DEFAULT_CATEGORIES,
    createdAt: now,
    updatedAt: now,
  };
};
