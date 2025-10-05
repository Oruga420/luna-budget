"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { BudgetSettings } from "../domain/types";
import {
  loadSettings,
  resetSettings,
  saveSettings,
} from "../lib/storage/settings";

interface SettingsContextValue {
  settings: BudgetSettings | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateSettings: (
    input: Partial<Omit<BudgetSettings, "id" | "createdAt" | "updatedAt">>
  ) => Promise<BudgetSettings | null>;
  reset: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [settings, setSettings] = useState<BudgetSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const hydrate = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loadSettings();
      setSettings(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load settings", err);
      setError("No se pudieron cargar los ajustes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const updateSettings = useCallback<SettingsContextValue["updateSettings"]>(
    async (input) => {
      setSaving(true);
      try {
        const next = await saveSettings(input);
        setSettings(next);
        setError(null);
        return next;
      } catch (err) {
        console.error("Failed to persist settings", err);
        setError("No se pudieron guardar los ajustes.");
        return null;
      } finally {
        setSaving(false);
      }
    },
  []);

  const reset = useCallback(async () => {
    setSaving(true);
    try {
      const defaults = await resetSettings();
      setSettings(defaults);
      setError(null);
    } catch (err) {
      console.error("Failed to reset settings", err);
      setError("No se pudieron restablecer los ajustes.");
    } finally {
      setSaving(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await hydrate();
  }, [hydrate]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      loading,
      saving,
      error,
      refresh,
      updateSettings,
      reset,
    }),
    [error, loading, refresh, reset, saving, settings, updateSettings],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings debe usarse dentro de SettingsProvider");
  }
  return ctx;
};
