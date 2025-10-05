import type { BudgetEntry, ExpenseType } from "../../domain/types";

export interface EntryFilters {
  search: string;
  category: string | "all";
  type: ExpenseType | "all";
  fromDate: string | null;
  toDate: string | null;
}

const normalize = (value: string) => value.trim().toLocaleLowerCase();

const matchesSearch = (entry: BudgetEntry, term: string) => {
  if (!term) return true;
  const haystack = `${entry.itemName} ${entry.notes ?? ""}`.toLocaleLowerCase();
  return haystack.includes(normalize(term));
};

const matchesCategory = (entry: BudgetEntry, category: EntryFilters["category"]) => {
  if (category === "all") return true;
  return entry.category === category;
};

const matchesType = (entry: BudgetEntry, typeFilter: EntryFilters["type"]) => {
  if (typeFilter === "all") return true;
  return entry.type === typeFilter;
};

const isWithinRange = (entry: BudgetEntry, filters: EntryFilters) => {
  if (!filters.fromDate && !filters.toDate) return true;
  const date = entry.dateIso;
  if (filters.fromDate && date < filters.fromDate) return false;
  if (filters.toDate && date > filters.toDate) return false;
  return true;
};

export const filterEntries = (entries: BudgetEntry[], filters: EntryFilters) =>
  entries.filter(
    (entry) =>
      matchesCategory(entry, filters.category) &&
      matchesType(entry, filters.type) &&
      matchesSearch(entry, filters.search) &&
      isWithinRange(entry, filters),
  );

export const sortEntriesByDateDesc = (entries: BudgetEntry[]) =>
  [...entries].sort((a, b) => (a.dateIso < b.dateIso ? 1 : a.dateIso > b.dateIso ? -1 : 0));

export const filterAndSortEntries = (entries: BudgetEntry[], filters: EntryFilters) =>
  sortEntriesByDateDesc(filterEntries(entries, filters));
