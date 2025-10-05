"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FixedExpense } from "../../domain/types";
import {
  deleteFixedExpense,
  listFixedExpenses,
  upsertFixedExpense,
  type FixedExpenseInput,
} from "../storage/fixed-expenses";

export const useFixedExpensesManager = () => {
  const [items, setItems] = useState<FixedExpense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listFixedExpenses();
      setItems(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = useCallback(async (input: FixedExpenseInput) => {
    const saved = await upsertFixedExpense(input);
    setItems((prev) => {
      const without = prev.filter((item) => item.id !== saved.id);
      return [...without, saved];
    });
    return saved;
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteFixedExpense(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const monthlyTotal = useMemo(
    () => items.reduce((total, item) => total + item.amount, 0),
    [items],
  );

  return {
    items,
    loading,
    refresh,
    save,
    remove,
    monthlyTotal,
  };
};
