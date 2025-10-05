"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { BudgetEntry } from "../../domain/types";
import type { EntryInput } from "../storage/entries";
import { deleteEntry, listEntriesByMonth, upsertEntry } from "../storage/entries";
import { filterAndSortEntries, type EntryFilters } from "../entries/filter";

const createDefaultFilters = (): EntryFilters => ({
  search: "",
  category: "all",
  type: "all",
  fromDate: null,
  toDate: null,
});

export const useEntriesManager = (monthKey: string) => {
  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<EntryFilters>(createDefaultFilters);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listEntriesByMonth(monthKey);
      setEntries(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, [monthKey]);

  useEffect(() => {
    setFilters(createDefaultFilters());
  }, [monthKey]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveEntry = useCallback(
    async (input: EntryInput) => {
      const saved = await upsertEntry(input);
      setEntries((prev) => {
        const filtered = prev.filter((entry) => entry.id !== saved.id);
        if (saved.monthKey !== monthKey) {
          return filtered;
        }
        return [...filtered, saved];
      });
      return saved;
    },
    [monthKey],
  );

  const removeEntry = useCallback(async (id: string) => {
    await deleteEntry(id);
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const updateFilters = useCallback(
    (patch: Partial<EntryFilters>) => {
      setFilters((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  const filteredEntries = useMemo(
    () => filterAndSortEntries(entries, filters),
    [entries, filters],
  );

  const spent = useMemo(
    () => entries.reduce((total, entry) => total + entry.amount, 0),
    [entries],
  );

  return {
    entries,
    filteredEntries,
    filters,
    updateFilters,
    setFilters,
    loading,
    refresh,
    saveEntry,
    removeEntry,
    spent,
  };
};

export type { EntryFilters };
