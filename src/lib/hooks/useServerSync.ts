"use client";

import { useCallback, useEffect, useState } from "react";
import type { BudgetEntry, BudgetSettings, FixedExpense } from "../../domain/types";

interface ServerData {
  settings: BudgetSettings | null;
  entries: BudgetEntry[];
  fixedExpenses: FixedExpense[];
  categories: string[];
}

export const useServerSync = () => {
  const [data, setData] = useState<ServerData>({
    settings: null,
    entries: [],
    fixedExpenses: [],
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from server on mount
  const loadFromServer = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/data");

      if (!response.ok) {
        throw new Error("Failed to fetch data from server");
      }

      const serverData = await response.json();
      setData(serverData);
    } catch (err) {
      console.error("Error loading from server:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Save data to server
  const saveToServer = useCallback(async (newData: Partial<ServerData>) => {
    setSyncing(true);
    setError(null);

    try {
      const updatedData = { ...data, ...newData };

      const response = await fetch("/api/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Failed to save data to server");
      }

      setData(updatedData);
      return true;
    } catch (err) {
      console.error("Error saving to server:", err);
      setError(err instanceof Error ? err.message : "Failed to save data");
      return false;
    } finally {
      setSyncing(false);
    }
  }, [data]);

  // Load on mount
  useEffect(() => {
    void loadFromServer();
  }, [loadFromServer]);

  return {
    data,
    loading,
    syncing,
    error,
    loadFromServer,
    saveToServer,
    setData,
  };
};
