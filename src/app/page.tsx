"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Download,
  Edit,
  Loader2,
  Plus,
  Search,
  Settings as SettingsIcon,
  Trash2,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Navigation } from "../components/Navigation";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { BudgetEntry, FixedExpense } from "../domain/types";
import {
  entryFormSchema,
  fixedExpenseFormSchema,
  categoryNameSchema,
  type EntryFormData,
  type FixedExpenseFormData,
} from "../domain/schemas";
import { useSettings } from "../state/settings-context";
import { formatCurrency, formatPercent } from "../lib/utils/format";
import { getMonthKey } from "../lib/utils/date";
import {
  buildCsvBlob,
  buildMonthFilename,
  serializeEntriesToCsv,
} from "../lib/export/csv";
import { triggerBrowserDownload } from "../lib/export/download";
import { useEntriesManager } from "../lib/hooks/useEntriesManager";
import type { EntryFilters } from "../lib/hooks/useEntriesManager";
import { useFixedExpensesManager } from "../lib/hooks/useFixedExpensesManager";
import { addCategory, renameCategory, removeCategory } from "../lib/storage/categories";

const currencyOptions = ["MXN", "USD", "EUR", "COP", "ARS", "CAD"] as const;

const expenseTypeLabels: Record<"fixed" | "variable", string> = {
  fixed: "Fijo",
  variable: "Variable",
};

interface EntryFormState {
  id?: string;
  itemName: string;
  amount: string;
  currency: string;
  category: string;
  type: "fixed" | "variable";
  date: string;
  notes: string;
}

interface FixedExpenseFormState {
  id?: string;
  name: string;
  amount: string;
  category: string;
  billingDay: string;
  notes: string;
}

const getTodayLocalIso = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
};

const ensureValidCategory = (value: string, categories: string[]) => {
  if (value && categories.includes(value)) {
    return value;
  }
  return categories[0] ?? "";
};

const formatDisplayDate = (iso: string) => {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) {
    return iso;
  }
  return `${day}/${month}/${year}`;
};

const createEntryState = (
  entry: BudgetEntry | null,
  categories: string[],
  defaultCurrency: string,
): EntryFormState => ({
  id: entry?.id,
  itemName: entry?.itemName ?? "",
  amount: entry ? String(entry.amount) : "",
  currency: entry?.currency ?? defaultCurrency,
  category: ensureValidCategory(entry?.category ?? "", categories),
  type: entry?.type ?? "variable",
  date: entry?.dateIso ?? getTodayLocalIso(),
  notes: entry?.notes ?? "",
});

const SummaryCard = ({
  label,
  value,
  helper,
  helperColor,
}: {
  label: string;
  value: string;
  helper?: string;
  helperColor?: string;
}) => (
  <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
    <p className="text-sm font-medium uppercase tracking-wide text-[var(--color-foreground-muted)]">
      {label}
    </p>
    <p className="mt-3 text-3xl font-semibold text-[var(--color-foreground)]">{value}</p>
    {helper ? (
      <p className={`mt-2 text-sm font-bold ${helperColor || "text-[var(--color-foreground-muted)]"}`}>{helper}</p>
    ) : null}
  </div>
);

const SettingsForm = () => {
  const { settings, updateSettings, saving, error } = useSettings();
  const [form, setForm] = useState<{
    budget: string;
    savingsGoal: string;
    alertThresholdPct: number;
    currency: string;
  } | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!settings) return;
    setForm({
      budget: settings.budget ? String(settings.budget) : "",
      savingsGoal: settings.savingsGoal ? String(settings.savingsGoal) : "",
      alertThresholdPct: Math.round(settings.alertThresholdPct * 100),
      currency: settings.currency,
    });
  }, [settings]);

  if (!form) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    const payload = {
      budget: Number(form.budget) || 0,
      savingsGoal: Number(form.savingsGoal) || 0,
      alertThresholdPct: Math.min(Math.max(form.alertThresholdPct / 100, 0), 1),
      currency: form.currency,
    };

    const result = await updateSettings(payload);
    if (result) {
      setStatus("Ajustes guardados.");
    }
  };

  return (
    <form
      className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-5 w-5 text-[var(--color-primary)]" />
        <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
          Ajustes mensuales
        </h2>
      </div>
      <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">
        Define tu presupuesto base, la meta de ahorro y el porcentaje que dispara la alerta de sobre gasto.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-foreground)]">
          Presupuesto mensual
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.01}
            value={form.budget}
            onChange={(event) =>
              setForm((prev) =>
                prev
                  ? {
                      ...prev,
                      budget: event.target.value,
                    }
                  : prev,
              )
            }
            className="rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-3 text-base shadow-inner focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)]"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-foreground)]">
          Meta de ahorro
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.01}
            value={form.savingsGoal}
            onChange={(event) =>
              setForm((prev) =>
                prev
                  ? {
                      ...prev,
                      savingsGoal: event.target.value,
                    }
                  : prev,
              )
            }
            className="rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-3 text-base shadow-inner focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)]"
          />
        </label>

        <label className="md:col-span-2 flex flex-col gap-2 text-sm font-medium text-[var(--color-foreground)]">
          Umbral de alerta ({form.alertThresholdPct}% del presupuesto)
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={form.alertThresholdPct}
            onChange={(event) =>
              setForm((prev) =>
                prev
                  ? {
                      ...prev,
                      alertThresholdPct: Number(event.target.value),
                    }
                  : prev,
              )
            }
            className="accent-[var(--color-primary)]"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-foreground)]">
          Moneda principal
          <select
            value={form.currency}
            onChange={(event) =>
              setForm((prev) =>
                prev
                  ? {
                      ...prev,
                      currency: event.target.value,
                    }
                  : prev,
              )
            }
            className="rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-3 text-base focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)]"
          >
            {currencyOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl border border-[var(--color-danger)] bg-[#ffe3e3] px-4 py-3 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}

      {status ? (
        <p className="mt-4 rounded-2xl border border-[var(--color-accent-soft)] bg-[#f0fffd] px-4 py-3 text-sm text-[var(--color-accent)]">
          {status}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-full border border-transparent bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#e86b00] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Guardar ajustes
        </button>
        <p className="text-xs text-[var(--color-foreground-muted)]">
          Guardado localmente en tu navegador. Gestiona categorias y gastos fijos desde el panel lateral.
        </p>
      </div>
    </form>
  );
};

const ExportButton = ({
  monthKey,
  entries,
  onRefresh,
}: {
  monthKey: string;
  entries: BudgetEntry[];
  onRefresh: () => Promise<BudgetEntry[]>;
}) => {
  const { settings } = useSettings();
  const [exporting, setExporting] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = async () => {
    if (!settings) return;

    setExporting(true);
    setMessage(null);

    try {
      const currentEntries = entries.length ? entries : await onRefresh();
      const csv = serializeEntriesToCsv(currentEntries, settings, monthKey);
      const blob = buildCsvBlob(csv);
      const filename = buildMonthFilename(monthKey);
      triggerBrowserDownload(blob, filename);
      setMessage(
        currentEntries.length
          ? `Exportamos ${currentEntries.length} movimientos.`
          : "Exportamos un CSV vacio con los encabezados.",
      );
    } catch (err) {
      console.error("CSV export failed", err);
      setMessage("No se pudo generar el CSV. Intenta de nuevo.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)]/30 text-[var(--color-accent)]">
          <Download className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
            Exportar mes actual
          </h2>
          <p className="text-sm text-[var(--color-foreground-muted)]">
            Descarga tus gastos del mes {monthKey} en formato CSV listo para Sheets o Excel.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleExport}
        disabled={exporting || !settings}
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-transparent bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#17b6b5] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {exporting ? "Generando..." : "Exportar CSV"}
      </button>

      {message ? (
        <p className="mt-4 rounded-2xl border border-[var(--color-accent-soft)] bg-[#f0fffd] px-4 py-3 text-sm text-[var(--color-accent)]">
          {message}
        </p>
      ) : null}
    </div>
  );
};

interface EntryComposerProps {
  categories: string[];
  currencyOptions: readonly string[];
  defaultCurrency: string;
  mode: "create" | "edit";
  initialEntry: BudgetEntry | null;
  submitting: boolean;
  onSubmit: (data: EntryFormData) => Promise<void>;
  onCancel?: () => void;
  error?: string | null;
}

const EntryComposer = ({
  categories,
  currencyOptions: currencyChoices,
  defaultCurrency,
  mode,
  initialEntry,
  submitting,
  onSubmit,
  onCancel,
  error,
}: EntryComposerProps) => {
  const wasEditingRef = useRef(false);
  const [form, setForm] = useState<EntryFormState>(() =>
    createEntryState(initialEntry, categories, defaultCurrency),
  );
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof EntryFormState, string>>>({});

  const initialState = useMemo(
    () => createEntryState(initialEntry, categories, defaultCurrency),
    [initialEntry, categories, defaultCurrency],
  );

  useEffect(() => {
    if (initialEntry) {
      wasEditingRef.current = true;
      setForm(initialState);
      setFieldErrors({});
    }
  }, [initialEntry, initialState]);

  useEffect(() => {
    setForm((prev) => {
      const nextCategory = ensureValidCategory(prev.category, categories);
      if (nextCategory === prev.category) {
        return prev;
      }
      return {
        ...prev,
        category: nextCategory,
      };
    });
  }, [categories]);

  useEffect(() => {
    if (!initialEntry && mode === "create" && wasEditingRef.current) {
      wasEditingRef.current = false;
      setForm(createEntryState(null, categories, defaultCurrency));
      setFieldErrors({});
    }
  }, [initialEntry, mode, categories, defaultCurrency]);

  if (!categories.length) {
    return (
      <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-foreground-muted)]">
        Agrega al menos una categoria para registrar movimientos.
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});

    const parsed = entryFormSchema.safeParse({
      id: form.id,
      itemName: form.itemName,
      amount: form.amount,
      currency: form.currency,
      category: form.category || categories[0],
      type: form.type,
      date: form.date,
      notes: form.notes.trim() ? form.notes : null,
    });

    if (!parsed.success) {
      const { fieldErrors: errors } = parsed.error.flatten();
      setFieldErrors({
        itemName: errors.itemName?.[0],
        amount: errors.amount?.[0],
        currency: errors.currency?.[0],
        category: errors.category?.[0],
        type: errors.type?.[0],
        date: errors.date?.[0],
        notes: errors.notes?.[0],
      });
      return;
    }

    await onSubmit(parsed.data);
    if (mode === "create") {
      setForm(createEntryState(null, categories, defaultCurrency));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-elevated)] p-6 shadow-[var(--shadow-soft)]"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-foreground)]">
            {mode === "create" ? "Registrar movimiento" : "Editar movimiento"}
          </h3>
          <p className="text-sm text-[var(--color-foreground-muted)]">
            Captura gastos manuales con categorias y notas opcionales.
          </p>
        </div>
        {mode === "edit" && onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-foreground-muted)] transition hover:border-[var(--color-border-strong)]"
          >
            <X className="h-3.5 w-3.5" />
            Cancelar
          </button>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-foreground)]">
          Nombre del item
          <input
            type="text"
            value={form.itemName}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                itemName: event.target.value,
              }))
            }
            className="rounded-2xl border border-[var(--color-border-strong)] bg-white px-4 py-3 text-base shadow-inner focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)]"
            placeholder="Ej. Supermercado"
          />
          {fieldErrors.itemName ? (
            <span className="text-xs text-[var(--color-danger)]">{fieldErrors.itemName}</span>
          ) : null}
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-foreground)]">
          Monto
          <input
            type="number"
            inputMode="decimal"
            step={0.01}
            min={0}
            value={form.amount}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                amount: event.target.value,
              }))
            }
            className="rounded-2xl border border-[var(--color-border-strong)] bg-white px-4 py-3 text-base shadow-inner focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)]"
          />
          {fieldErrors.amount ? (
            <span className="text-xs text-[var(--color-danger)]">{fieldErrors.amount}</span>
          ) : null}
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-foreground)]">
          Categoria
          <select
            value={form.category}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                category: event.target.value,
              }))
            }
            className="rounded-2xl border border-[var(--color-border-strong)] bg-white px-4 py-3 text-base focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)]"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {fieldErrors.category ? (
            <span className="text-xs text-[var(--color-danger)]">{fieldErrors.category}</span>
          ) : null}
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-foreground)]">
          Tipo
          <select
            value={form.type}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                type: event.target.value as EntryFormState["type"],
              }))
            }
            className="rounded-2xl border border-[var(--color-border-strong)] bg-white px-4 py-3 text-base focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)]"
          >
            <option value="variable">Variable</option>
            <option value="fixed">Fijo</option>
          </select>
          {fieldErrors.type ? (
            <span className="text-xs text-[var(--color-danger)]">{fieldErrors.type}</span>
          ) : null}
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-foreground)]">
          Fecha
          <input
            type="date"
            value={form.date}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                date: event.target.value,
              }))
            }
            className="rounded-2xl border border-[var(--color-border-strong)] bg-white px-4 py-3 text-base focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)]"
          />
          {fieldErrors.date ? (
            <span className="text-xs text-[var(--color-danger)]">{fieldErrors.date}</span>
          ) : null}
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-foreground)]">
          Moneda del movimiento
          <select
            value={form.currency}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                currency: event.target.value,
              }))
            }
            className="rounded-2xl border border-[var(--color-border-strong)] bg-white px-4 py-3 text-base focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)]"
          >
            {currencyChoices.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {fieldErrors.currency ? (
            <span className="text-xs text-[var(--color-danger)]">{fieldErrors.currency}</span>
          ) : null}
        </label>

        <label className="md:col-span-2 flex flex-col gap-2 text-sm font-medium text-[var(--color-foreground)]">
          Notas (opcional)
          <textarea
            value={form.notes}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                notes: event.target.value,
              }))
            }
            rows={3}
            className="rounded-2xl border border-[var(--color-border-strong)] bg-white px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)]"
            placeholder="Detalles adicionales, referencia, etc."
          />
          {fieldErrors.notes ? (
            <span className="text-xs text-[var(--color-danger)]">{fieldErrors.notes}</span>
          ) : null}
        </label>
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl border border-[var(--color-danger)] bg-[#ffe3e3] px-4 py-3 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-full border border-transparent bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#e86b00] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "create" ? <Plus className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          {mode === "create" ? "Guardar movimiento" : "Actualizar movimiento"}
        </button>
        {mode === "create" ? (
          <p className="text-xs text-[var(--color-foreground-muted)]">
            Tip: usa categorias para segmentar tus gastos y facilitar la visualizacion.
          </p>
        ) : null}
      </div>
    </form>
  );
};

interface EntriesSectionProps {
  categories: string[];
  currency: string;
  currencyOptions: readonly string[];
  manager: ReturnType<typeof useEntriesManager>;
}

const EntriesSection = ({
  categories,
  currency,
  currencyOptions: currencyChoices,
  manager,
}: EntriesSectionProps) => {
  const {
    filteredEntries,
    filters,
    updateFilters,
    setFilters,
    loading,
    saveEntry,
    removeEntry,
  } = manager;
  const [editingEntry, setEditingEntry] = useState<BudgetEntry | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSubmit = useCallback(
    async (data: EntryFormData) => {
      setSubmitting(true);
      setFormError(null);
      setStatus(null);
      try {
        await saveEntry({
          id: data.id,
          itemName: data.itemName,
          amount: data.amount,
          currency: data.currency,
          category: data.category,
          type: data.type,
          source: editingEntry?.source ?? "manual",
          notes: data.notes ?? null,
          imageRef: editingEntry?.imageRef ?? null,
          date: data.date,
        });
        setStatus(editingEntry ? "Movimiento actualizado." : "Movimiento registrado.");
        setEditingEntry(null);
        setDialogOpen(false);
      } catch (err) {
        console.error("Failed to persist entry", err);
        setFormError("No se pudo guardar el movimiento.");
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [editingEntry, saveEntry],
  );

  const handleDelete = useCallback(
    async (entry: BudgetEntry) => {
      if (!window.confirm("Eliminar este movimiento?")) {
        return;
      }
      setDeletingId(entry.id);
      setFormError(null);
      setStatus(null);
      try {
        await removeEntry(entry.id);
        setStatus("Movimiento eliminado.");
        if (editingEntry?.id === entry.id) {
          setEditingEntry(null);
        }
      } catch (err) {
        console.error("Failed to delete entry", err);
        setFormError("No se pudo eliminar el movimiento.");
      } finally {
        setDeletingId(null);
      }
    },
    [editingEntry, removeEntry],
  );

  const resetFilters = () => {
    setFilters({
      search: "",
      category: "all",
      type: "all",
      fromDate: null,
      toDate: null,
    });
  };

  return (
    <section className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
            Movimientos del mes
          </h2>
          <p className="text-sm text-[var(--color-foreground-muted)]">
            Administra tus gastos diarios, filtra por categoria, tipo o rango de fechas.
          </p>
        </div>
        <span className="rounded-full bg-[var(--color-elevated)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-foreground-muted)]">
          {filteredEntries.length} resultados
        </span>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          setEditingEntry(null);
          setFormError(null);
        }
      }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? "Editar movimiento" : "Nuevo movimiento"}
            </DialogTitle>
          </DialogHeader>
          <EntryComposer
            categories={categories}
            currencyOptions={currencyChoices}
            defaultCurrency={currency}
            mode={editingEntry ? "edit" : "create"}
            initialEntry={editingEntry}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => {
              setEditingEntry(null);
              setDialogOpen(false);
            }}
            error={formError}
          />
        </DialogContent>
      </Dialog>

      <div className="mt-6 grid gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-elevated)] p-3 sm:gap-4 sm:p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-3 py-2 text-xs text-[var(--color-foreground-muted)] sm:text-sm">
            <Search className="h-4 w-4 flex-shrink-0" />
            <input
              type="search"
              value={filters.search}
              onChange={(event) => updateFilters({ search: event.target.value })}
              placeholder="Buscar"
              className="w-full border-none bg-transparent text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-muted)] focus:outline-none"
            />
          </label>

          <select
            value={filters.category}
            onChange={(event) => updateFilters({ category: event.target.value })}
            className="rounded-full border border-[var(--color-border)] bg-white px-3 py-2 text-xs text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none sm:px-4 sm:text-sm"
          >
            <option value="all">Todas las categorias</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={filters.type}
            onChange={(event) => updateFilters({ type: event.target.value as EntryFilters["type"] })}
            className="rounded-full border border-[var(--color-border)] bg-white px-3 py-2 text-xs text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none sm:px-4 sm:text-sm"
          >
            <option value="all">Todos los tipos</option>
            <option value="variable">Variables</option>
            <option value="fixed">Fijos</option>
          </select>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 sm:gap-3">
          <input
            type="date"
            value={filters.fromDate ?? ""}
            onChange={(event) => updateFilters({ fromDate: event.target.value || null })}
            className="rounded-full border border-[var(--color-border)] bg-white px-3 py-2 text-xs text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none sm:px-4 sm:text-sm"
            placeholder="Desde"
          />
          <span className="flex items-center text-xs font-bold text-[var(--color-foreground-muted)] sm:text-sm">a</span>
          <input
            type="date"
            value={filters.toDate ?? ""}
            onChange={(event) => updateFilters({ toDate: event.target.value || null })}
            className="rounded-full border border-[var(--color-border)] bg-white px-3 py-2 text-xs text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none sm:px-4 sm:text-sm"
            placeholder="Hasta"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-semibold uppercase tracking-wide text-[var(--color-foreground-muted)] transition hover:text-[var(--color-foreground)]"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {status ? (
        <p className="mt-4 rounded-2xl border border-[var(--color-accent-soft)] bg-[#f0fffd] px-4 py-3 text-sm text-[var(--color-accent)]">
          {status}
        </p>
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--color-border)]">
        <table className="min-w-full text-left text-xs sm:text-sm">
          <thead className="text-[10px] uppercase tracking-wide text-[var(--color-foreground-muted)] sm:text-xs">
            <tr>
              <th className="px-2 py-2 sm:px-4 sm:py-3">Fecha</th>
              <th className="px-2 py-2 sm:px-4 sm:py-3">Item</th>
              <th className="px-2 py-2 sm:px-4 sm:py-3">Categoria</th>
              <th className="px-2 py-2 sm:px-4 sm:py-3">Tipo</th>
              <th className="px-2 py-2 sm:px-4 sm:py-3">Monto</th>
              <th className="hidden px-2 py-2 sm:table-cell sm:px-4 sm:py-3">Notas</th>
              <th className="px-2 py-2 text-right sm:px-4 sm:py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-[var(--color-foreground-muted)]">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-xs font-semibold uppercase tracking-wide">
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--color-primary)]" /> Cargando movimientos
                  </span>
                </td>
              </tr>
            ) : filteredEntries.length ? (
              filteredEntries.map((entry) => (
                <tr key={entry.id} className="border-t border-[var(--color-border)] text-[var(--color-foreground)]">
                  <td className="px-2 py-2 align-top text-xs font-medium sm:px-4 sm:py-3 sm:text-sm">
                    {formatDisplayDate(entry.dateIso)}
                  </td>
                  <td className="px-2 py-2 align-top sm:px-4 sm:py-3">
                    <div className="text-xs font-semibold sm:text-sm">{entry.itemName}</div>
                    <p className="text-[10px] text-[var(--color-foreground-muted)] sm:text-xs">
                      {entry.source === "image" ? "Capturado desde foto" : "Ingreso manual"}
                    </p>
                  </td>
                  <td className="px-2 py-2 align-top text-xs capitalize sm:px-4 sm:py-3 sm:text-sm">{entry.category}</td>
                  <td className="px-2 py-2 align-top text-xs sm:px-4 sm:py-3 sm:text-sm">{expenseTypeLabels[entry.type]}</td>
                  <td className="px-2 py-2 align-top text-xs font-semibold sm:px-4 sm:py-3 sm:text-sm">
                    {formatCurrency(entry.amount, entry.currency)}
                  </td>
                  <td className="hidden px-2 py-2 align-top text-xs text-[var(--color-foreground-muted)] sm:table-cell sm:px-4 sm:py-3 sm:text-sm">
                    {entry.notes ? entry.notes : ""}
                  </td>
                  <td className="px-2 py-2 align-top sm:px-4 sm:py-3">
                    <div className="flex justify-end gap-1 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setStatus(null);
                          setFormError(null);
                          setEditingEntry(entry);
                          setDialogOpen(true);
                        }}
                        className="inline-flex items-center gap-0.5 rounded-full border border-[var(--color-border)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-foreground-muted)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-foreground)] sm:gap-1 sm:px-3 sm:text-xs"
                      >
                        <Edit className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden sm:inline">Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(entry)}
                        disabled={deletingId === entry.id}
                        className="inline-flex items-center gap-0.5 rounded-full border border-[var(--color-border)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-danger)] transition hover:border-[var(--color-danger)] hover:text-[var(--color-danger)] disabled:cursor-not-allowed disabled:opacity-70 sm:gap-1 sm:px-3 sm:text-xs"
                      >
                        {deletingId === entry.id ? (
                          <Loader2 className="h-3 w-3 animate-spin sm:h-3.5 sm:w-3.5" />
                        ) : (
                          <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        )}
                        <span className="hidden sm:inline">Borrar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-[var(--color-foreground-muted)]">
                  No hay movimientos que coincidan con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={() => {
          setStatus(null);
          setFormError(null);
          setEditingEntry(null);
          setDialogOpen(true);
        }}
        className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-[0_8px_16px_rgba(0,0,0,0.15)] transition hover:scale-105 hover:bg-[var(--color-primary-strong)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-soft)] sm:bottom-8 sm:right-8 sm:h-16 sm:w-16"
        aria-label="Agregar movimiento"
      >
        <Plus className="h-7 w-7 sm:h-8 sm:w-8" />
      </button>
    </section>
  );
};

interface CategoryManagerProps {
  categories: string[];
  onAdd: (name: string) => Promise<void>;
  onRename: (current: string, next: string) => Promise<void>;
  onRemove: (target: string, fallback: string) => Promise<void>;
}

const CategoryManager = ({ categories, onAdd, onRename, onRemove }: CategoryManagerProps) => {
  const [newCategory, setNewCategory] = useState("");
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAdding(true);
    setFeedback(null);
    setError(null);
    try {
      const parsed = categoryNameSchema.parse(newCategory);
      await onAdd(parsed);
      setFeedback("Categoria creada.");
      setNewCategory("");
    } catch (err) {
      console.error("Failed to add category", err);
      setError(err instanceof Error ? err.message : "No se pudo crear la categoria.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <section className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
      <h2 className="text-lg font-semibold text-[var(--color-foreground)]">Categorias personalizadas</h2>
      <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">
        Administra las categorias disponibles para tus movimientos y gastos fijos.
      </p>

      <form onSubmit={handleAdd} className="mt-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={newCategory}
          onChange={(event) => setNewCategory(event.target.value)}
          placeholder="Nueva categoria"
          className="flex-1 min-w-[200px] rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
        />
        <button
          type="submit"
          disabled={adding}
          className="inline-flex items-center gap-2 rounded-full border border-transparent bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#e86b00] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Anadir
        </button>
      </form>

      {error ? (
        <p className="mt-3 rounded-2xl border border-[var(--color-danger)] bg-[#ffe3e3] px-4 py-2 text-xs text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}

      {feedback ? (
        <p className="mt-3 rounded-2xl border border-[var(--color-accent-soft)] bg-[#f0fffd] px-4 py-2 text-xs text-[var(--color-accent)]">
          {feedback}
        </p>
      ) : null}

      <ul className="mt-4 grid gap-2">
        {categories.map((category) => (
          <CategoryRow
            key={category}
            name={category}
            categories={categories}
            onRename={onRename}
            onRemove={onRemove}
          />
        ))}
      </ul>
    </section>
  );
};

interface CategoryRowProps {
  name: string;
  categories: string[];
  onRename: (current: string, next: string) => Promise<void>;
  onRemove: (target: string, fallback: string) => Promise<void>;
}

const CategoryRow = ({ name, categories, onRename, onRemove }: CategoryRowProps) => {
  const [mode, setMode] = useState<"view" | "rename" | "delete">("view");
  const [draft, setDraft] = useState(name);
  const [fallback, setFallback] = useState(() => categories.find((item) => item !== name) ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(name);
  }, [name]);

  useEffect(() => {
    setFallback((current) => {
      if (current && current !== name && categories.includes(current)) {
        return current;
      }
      return categories.find((item) => item !== name) ?? "";
    });
  }, [categories, name]);

  const handleRename = async () => {
    setBusy(true);
    setError(null);
    try {
      const parsed = categoryNameSchema.parse(draft);
      await onRename(name, parsed);
      setMode("view");
    } catch (err) {
      console.error("Failed to rename category", err);
      setError(err instanceof Error ? err.message : "No se pudo renombrar la categoria.");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    if (!fallback) {
      setError("Selecciona una categoria alternativa.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onRemove(name, fallback);
      setMode("view");
    } catch (err) {
      console.error("Failed to remove category", err);
      setError(err instanceof Error ? err.message : "No se pudo eliminar la categoria.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-elevated)] px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-foreground)]">{name}</p>
          {mode === "rename" ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-sm focus:border-[var(--color-primary)] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setMode("view");
                  setDraft(name);
                  setError(null);
                }}
                className="text-xs font-semibold uppercase tracking-wide text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]"
              >
                Cancelar
              </button>
            </div>
          ) : null}
          {mode === "delete" ? (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[var(--color-foreground-muted)]">Mover a:</span>
              <select
                value={fallback}
                onChange={(event) => setFallback(event.target.value)}
                className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-xs focus:border-[var(--color-primary)] focus:outline-none"
              >
                {categories
                  .filter((item) => item !== name)
                  .map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setMode("view");
                  setFallback(categories.find((item) => item !== name) ?? "");
                  setError(null);
                }}
                className="text-xs font-semibold uppercase tracking-wide text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]"
              >
                Cancelar
              </button>
            </div>
          ) : null}
          {error ? (
            <p className="mt-2 text-xs text-[var(--color-danger)]">{error}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide">
          {mode === "rename" ? (
            <button
              type="button"
              onClick={() => void handleRename()}
              disabled={busy}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--color-primary)] px-3 py-1 text-[var(--color-primary)] transition hover:bg-[var(--color-primary)]/10 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Edit className="h-3.5 w-3.5" />}
              Guardar
            </button>
          ) : mode === "delete" ? (
            <button
              type="button"
              onClick={() => void handleRemove()}
              disabled={busy}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--color-danger)] px-3 py-1 text-[var(--color-danger)] transition hover:bg-[var(--color-danger)]/10 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Confirmar
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setMode("rename");
                  setError(null);
                }}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-3 py-1 text-[var(--color-foreground-muted)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-foreground)]"
              >
                <Edit className="h-3.5 w-3.5" />
                Renombrar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (categories.length <= 1) return;
                  setMode("delete");
                  setError(null);
                }}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-3 py-1 text-[var(--color-danger)] transition hover:border-[var(--color-danger)] hover:text-[var(--color-danger)] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={categories.length <= 1}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
};

const createFixedExpenseState = (
  item: FixedExpense | null,
  categories: string[],
): FixedExpenseFormState => ({
  id: item?.id,
  name: item?.name ?? "",
  amount: item ? String(item.amount) : "",
  category: ensureValidCategory(item?.category ?? "", categories),
  billingDay: item?.billingDay ? String(item.billingDay) : "",
  notes: item?.notes ?? "",
});

interface FixedExpenseComposerProps {
  categories: string[];
  defaultCategory: string;
  mode: "create" | "edit";
  initialItem: FixedExpense | null;
  submitting: boolean;
  onSubmit: (data: FixedExpenseFormData) => Promise<void>;
  onCancel?: () => void;
  error?: string | null;
}

const FixedExpenseComposer = ({
  categories,
  defaultCategory,
  mode,
  initialItem,
  submitting,
  onSubmit,
  onCancel,
  error,
}: FixedExpenseComposerProps) => {
  const wasEditingRef = useRef(false);
  const [form, setForm] = useState<FixedExpenseFormState>(() =>
    createFixedExpenseState(initialItem, categories),
  );
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FixedExpenseFormState, string>>>({});

  const initialState = useMemo(
    () => createFixedExpenseState(initialItem, categories),
    [initialItem, categories],
  );

  useEffect(() => {
    if (initialItem) {
      wasEditingRef.current = true;
      setForm(initialState);
      setFieldErrors({});
    }
  }, [initialItem, initialState]);

  useEffect(() => {
    setForm((prev) => {
      const nextCategory = ensureValidCategory(prev.category, categories);
      if (nextCategory === prev.category) {
        return prev;
      }
      return {
        ...prev,
        category: nextCategory || defaultCategory,
      };
    });
  }, [categories, defaultCategory]);

  useEffect(() => {
    if (!initialItem && mode === "create" && wasEditingRef.current) {
      wasEditingRef.current = false;
      setForm(createFixedExpenseState(null, categories));
      setFieldErrors({});
    }
  }, [initialItem, mode, categories]);

  if (!categories.length) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-elevated)] p-4 text-xs text-[var(--color-foreground-muted)]">
        Necesitas al menos una categoria para registrar gastos fijos.
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});

    const parsed = fixedExpenseFormSchema.safeParse({
      id: form.id,
      name: form.name,
      amount: form.amount,
      category: form.category || categories[0],
      billingDay: form.billingDay ? form.billingDay : null,
      notes: form.notes.trim() ? form.notes : null,
    });

    if (!parsed.success) {
      const { fieldErrors: errors } = parsed.error.flatten();
      setFieldErrors({
        name: errors.name?.[0],
        amount: errors.amount?.[0],
        category: errors.category?.[0],
        billingDay: errors.billingDay?.[0],
        notes: errors.notes?.[0],
      });
      return;
    }

    await onSubmit(parsed.data);
    if (mode === "create") {
      setForm(createFixedExpenseState(null, categories));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-xs font-semibold text-[var(--color-foreground)]">
          Nombre
          <input
            type="text"
            value={form.name}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                name: event.target.value,
              }))
            }
            className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
            placeholder="Ej. Renta"
          />
          {fieldErrors.name ? (
            <span className="text-[var(--color-danger)]">{fieldErrors.name}</span>
          ) : null}
        </label>

        <label className="flex flex-col gap-2 text-xs font-semibold text-[var(--color-foreground)]">
          Monto mensual
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.01}
            value={form.amount}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                amount: event.target.value,
              }))
            }
            className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
          />
          {fieldErrors.amount ? (
            <span className="text-[var(--color-danger)]">{fieldErrors.amount}</span>
          ) : null}
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
        <label className="flex flex-col gap-2 text-xs font-semibold text-[var(--color-foreground)]">
          Categoria
          <select
            value={form.category}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                category: event.target.value,
              }))
            }
            className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {fieldErrors.category ? (
            <span className="text-[var(--color-danger)]">{fieldErrors.category}</span>
          ) : null}
        </label>

        <label className="flex flex-col gap-2 text-xs font-semibold text-[var(--color-foreground)]">
          Dia de cobro (1-31)
          <input
            type="number"
            min={1}
            max={31}
            value={form.billingDay}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                billingDay: event.target.value,
              }))
            }
            className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
            placeholder="Opcional"
          />
          {fieldErrors.billingDay ? (
            <span className="text-[var(--color-danger)]">{fieldErrors.billingDay}</span>
          ) : null}
        </label>
      </div>

      <label className="flex flex-col gap-2 text-xs font-semibold text-[var(--color-foreground)]">
        Notas (opcional)
        <textarea
          value={form.notes}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              notes: event.target.value,
            }))
          }
          rows={3}
          className="rounded-2xl border border-[var(--color-border)] bg-white px-4 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
        />
        {fieldErrors.notes ? (
          <span className="text-[var(--color-danger)]">{fieldErrors.notes}</span>
        ) : null}
      </label>

      {error ? (
        <p className="rounded-2xl border border-[var(--color-danger)] bg-[#ffe3e3] px-4 py-2 text-xs text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-full border border-transparent bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#17b6b5] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : mode === "create" ? <Plus className="h-3.5 w-3.5" /> : <Edit className="h-3.5 w-3.5" />}
          {mode === "create" ? "Registrar gasto fijo" : "Actualizar gasto fijo"}
        </button>
        {mode === "edit" && onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold uppercase tracking-wide text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]"
          >
            Cancelar edicion
          </button>
        ) : null}
      </div>
    </form>
  );
};

interface FixedExpensesSectionProps {
  categories: string[];
  currency: string;
  manager: ReturnType<typeof useFixedExpensesManager>;
}

const FixedExpensesSection = ({ categories, currency, manager }: FixedExpensesSectionProps) => {
  const { items, loading, save, remove, monthlyTotal } = manager;
  const [editing, setEditing] = useState<FixedExpense | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [cellValue, setCellValue] = useState<string>("");

  const handleSubmit = useCallback(
    async (data: FixedExpenseFormData) => {
      setSubmitting(true);
      setStatus(null);
      setError(null);
      try {
        await save({
          id: data.id,
          name: data.name,
          amount: data.amount,
          category: data.category,
          billingDay: data.billingDay,
          notes: data.notes ?? null,
        });
        setStatus(editing ? "Gasto fijo actualizado." : "Gasto fijo registrado.");
        setEditing(null);
      } catch (err) {
        console.error("Failed to persist fixed expense", err);
        setError("No se pudo guardar el gasto fijo.");
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [editing, save],
  );

  const handleDelete = useCallback(
    async (item: FixedExpense) => {
      if (!window.confirm("Eliminar este gasto fijo?")) {
        return;
      }
      setDeletingId(item.id);
      setStatus(null);
      setError(null);
      try {
        await remove(item.id);
        setStatus("Gasto fijo eliminado.");
        if (editing?.id === item.id) {
          setEditing(null);
        }
      } catch (err) {
        console.error("Failed to delete fixed expense", err);
        setError("No se pudo eliminar el gasto fijo.");
      } finally {
        setDeletingId(null);
      }
    },
    [editing, remove],
  );

  const handleCellClick = (item: FixedExpense, field: string) => {
    setEditingCell({ id: item.id, field });
    if (field === "name") setCellValue(item.name);
    else if (field === "category") setCellValue(item.category);
    else if (field === "billingDay") setCellValue(item.billingDay?.toString() ?? "");
    else if (field === "amount") setCellValue(item.amount.toString());
  };

  const handleCellBlur = async (item: FixedExpense) => {
    if (!editingCell) return;

    try {
      const updates: Partial<FixedExpense> = { ...item };

      if (editingCell.field === "name") updates.name = cellValue;
      else if (editingCell.field === "category") updates.category = cellValue;
      else if (editingCell.field === "billingDay") updates.billingDay = cellValue ? Number(cellValue) : null;
      else if (editingCell.field === "amount") updates.amount = Number(cellValue);

      await save({
        id: item.id,
        name: updates.name!,
        amount: updates.amount!,
        category: updates.category!,
        billingDay: updates.billingDay,
        notes: item.notes,
      });

      setStatus("Gasto fijo actualizado.");
    } catch (err) {
      console.error("Failed to update field", err);
      setError("No se pudo actualizar el campo.");
    } finally {
      setEditingCell(null);
    }
  };

  const handleCellKeyDown = (e: React.KeyboardEvent, item: FixedExpense) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCellBlur(item);
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  return (
    <section className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-foreground)]">Gastos fijos</h2>
          <p className="text-sm text-[var(--color-foreground-muted)]">
            Registra pagos recurrentes para proyectar tu flujo mensual.
          </p>
        </div>
        <span className="rounded-full bg-[var(--color-elevated)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-foreground-muted)]">
          {items.length} registrados
        </span>
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-elevated)] p-4">
        <FixedExpenseComposer
          categories={categories}
          defaultCategory={categories[0] ?? ""}
          mode={editing ? "edit" : "create"}
          initialItem={editing}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
          error={error}
        />
      </div>

      {status ? (
        <p className="mt-4 rounded-2xl border border-[var(--color-accent-soft)] bg-[#f0fffd] px-4 py-2 text-xs text-[var(--color-accent)]">
          {status}
        </p>
      ) : null}

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-[var(--color-foreground-muted)]">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Dia</th>
              <th className="px-4 py-3">Monto</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-xs text-[var(--color-foreground-muted)]">
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--color-primary)]" />
                </td>
              </tr>
            ) : items.length ? (
              items.map((item) => (
                <tr key={item.id} className="border-t border-[var(--color-border)]">
                  <td
                    className="cursor-pointer px-4 py-3 text-sm font-semibold text-[var(--color-foreground)] hover:bg-[var(--color-elevated)]"
                    onClick={() => handleCellClick(item, "name")}
                  >
                    {editingCell?.id === item.id && editingCell.field === "name" ? (
                      <input
                        type="text"
                        value={cellValue}
                        onChange={(e) => setCellValue(e.target.value)}
                        onBlur={() => handleCellBlur(item)}
                        onKeyDown={(e) => handleCellKeyDown(e, item)}
                        autoFocus
                        className="w-full rounded border border-[var(--color-primary)] bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                      />
                    ) : (
                      item.name
                    )}
                  </td>
                  <td
                    className="cursor-pointer px-4 py-3 text-sm text-[var(--color-foreground)] hover:bg-[var(--color-elevated)]"
                    onClick={() => handleCellClick(item, "category")}
                  >
                    {editingCell?.id === item.id && editingCell.field === "category" ? (
                      <select
                        value={cellValue}
                        onChange={async (e) => {
                          setCellValue(e.target.value);
                          try {
                            await save({
                              id: item.id,
                              name: item.name,
                              amount: item.amount,
                              category: e.target.value,
                              billingDay: item.billingDay,
                              notes: item.notes,
                            });
                            setStatus("Categoría actualizada.");
                            setEditingCell(null);
                          } catch (err) {
                            console.error("Failed to update category", err);
                            setError("No se pudo actualizar la categoría.");
                          }
                        }}
                        autoFocus
                        className="w-full rounded border border-[var(--color-primary)] bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    ) : (
                      item.category
                    )}
                  </td>
                  <td
                    className="cursor-pointer px-4 py-3 text-sm text-[var(--color-foreground)] hover:bg-[var(--color-elevated)]"
                    onClick={() => handleCellClick(item, "billingDay")}
                  >
                    {editingCell?.id === item.id && editingCell.field === "billingDay" ? (
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={cellValue}
                        onChange={(e) => setCellValue(e.target.value)}
                        onBlur={() => handleCellBlur(item)}
                        onKeyDown={(e) => handleCellKeyDown(e, item)}
                        autoFocus
                        className="w-full rounded border border-[var(--color-primary)] bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                      />
                    ) : (
                      item.billingDay ?? ""
                    )}
                  </td>
                  <td
                    className="cursor-pointer px-4 py-3 text-sm font-semibold text-[var(--color-foreground)] hover:bg-[var(--color-elevated)]"
                    onClick={() => handleCellClick(item, "amount")}
                  >
                    {editingCell?.id === item.id && editingCell.field === "amount" ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={cellValue}
                        onChange={(e) => setCellValue(e.target.value)}
                        onBlur={() => handleCellBlur(item)}
                        onKeyDown={(e) => handleCellKeyDown(e, item)}
                        autoFocus
                        className="w-full rounded border border-[var(--color-primary)] bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                      />
                    ) : (
                      formatCurrency(item.amount, currency)
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => void handleDelete(item)}
                        disabled={deletingId === item.id}
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-danger)] transition hover:border-[var(--color-danger)] hover:text-[var(--color-danger)] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {deletingId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        Borrar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-xs text-[var(--color-foreground-muted)]">
                  Aun no registras gastos fijos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-elevated)] px-4 py-3 text-xs font-semibold text-[var(--color-foreground-muted)]">
        Total mensual: {formatCurrency(monthlyTotal, currency)}
      </div>
    </section>
  );
};

export default function Home() {
  const { settings, loading, refresh } = useSettings();
  const monthKey = useMemo(() => getMonthKey(new Date()), []);
  const entriesManager = useEntriesManager(monthKey);
  const fixedExpensesManager = useFixedExpensesManager();
  const [currentPage, setCurrentPage] = useState<"home" | "settings">("home");
  const [chartView, setChartView] = useState<"variable" | "all">("variable");

  const categories = settings?.categories ?? [];
  const currency = settings?.currency ?? "MXN";
  const spent = entriesManager.spent;
  const fixedTotal = fixedExpensesManager.monthlyTotal;
  const totalSpent = spent + fixedTotal;
  const remaining = settings ? Math.max(settings.budget - totalSpent, 0) : 0;
  const thresholdReached =
    settings && settings.budget > 0
      ? totalSpent / settings.budget >= settings.alertThresholdPct
      : false;

  const refreshEntries = entriesManager.refresh;
  const refreshFixed = fixedExpensesManager.refresh;

  const handleAddCategory = useCallback(
    async (name: string) => {
      await addCategory(name);
      await Promise.all([refresh(), refreshEntries(), refreshFixed()]);
    },
    [refresh, refreshEntries, refreshFixed],
  );

  const handleRenameCategory = useCallback(
    async (current: string, next: string) => {
      await renameCategory(current, next);
      await Promise.all([refresh(), refreshEntries(), refreshFixed()]);
    },
    [refresh, refreshEntries, refreshFixed],
  );

  const handleRemoveCategory = useCallback(
    async (target: string, fallback: string) => {
      await removeCategory(target, fallback);
      await Promise.all([refresh(), refreshEntries(), refreshFixed()]);
    },
    [refresh, refreshEntries, refreshFixed],
  );

  // Calculate chart data
  const COLORS = [
    "var(--color-primary)",
    "var(--color-warning)",
    "var(--color-accent)",
    "var(--color-magenta)",
    "var(--color-yellow)",
    "var(--color-cyan)",
    "#ff6b9d",
    "#4ecdc4",
    "#95e1d3",
    "#f38181",
  ];

  const chartDataVariable = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    entriesManager.entries.forEach((entry) => {
      const cat = entry.category || "Sin categoría";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + entry.amount;
    });

    return Object.entries(categoryTotals)
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [entriesManager.entries]);

  const chartDataAll = useMemo(() => {
    const categoryTotals: Record<string, number> = {};

    // Add variable expenses
    entriesManager.entries.forEach((entry) => {
      const cat = entry.category || "Sin categoría";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + entry.amount;
    });

    // Add fixed expenses
    fixedExpensesManager.items.forEach((item) => {
      const cat = item.category || "Sin categoría";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + item.amount;
    });

    return Object.entries(categoryTotals)
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [entriesManager.entries, fixedExpensesManager.items]);

  const chartData = chartView === "variable" ? chartDataVariable : chartDataAll;

  // Calculate available for savings goal with color
  const savingsAvailable = remaining;
  const savingsColor = savingsAvailable > 6000
    ? "text-green-600"
    : savingsAvailable >= 4001
    ? "text-yellow-600"
    : "text-red-600";

  if (loading && !settings) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8 lg:gap-10 lg:px-10 lg:py-12">
      <header className="flex flex-col gap-3 sm:gap-4">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--color-primary-soft)]/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-primary)] sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.2em]">
          Luna Budget Keeper
        </span>
        <h1 className="text-2xl font-black text-[var(--color-foreground)] sm:text-3xl lg:text-4xl xl:text-5xl">
          Control total de tu presupuesto mensual
        </h1>
      </header>

      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />

      {thresholdReached && currentPage === "home" ? (
        <div className="flex items-start gap-3 rounded-[24px] border-[3px] border-[var(--color-warning)] bg-[#fff8e1] p-4 text-[var(--color-foreground)] shadow-[var(--shadow-soft)]">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-[var(--color-warning)]" />
          <div>
            <p className="text-sm font-bold uppercase tracking-wide">
              Alerta de presupuesto
            </p>
            <p className="text-sm font-bold text-[var(--color-foreground-muted)]">
              Has usado {formatPercent(settings!.alertThresholdPct, 0)} de tu presupuesto mensual.
            </p>
          </div>
        </div>
      ) : null}

      {currentPage === "home" ? (
        <div className="grid gap-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <SummaryCard
              label="Presupuesto"
              value={formatCurrency(settings?.budget ?? 0, currency)}
              helper={`Disponible: ${formatCurrency(remaining, currency)}`}
            />
            <SummaryCard
              label="Meta de ahorro"
              value={formatCurrency(settings?.savingsGoal ?? 0, currency)}
              helper={`Disponible: ${formatCurrency(savingsAvailable, currency)}`}
              helperColor={savingsColor}
            />
            <SummaryCard
              label="Gasto acumulado"
              value={formatCurrency(spent, currency)}
              helper={`Movimientos: ${entriesManager.entries.length}`}
            />
            <SummaryCard
              label="Gastos fijos mensuales"
              value={formatCurrency(fixedExpensesManager.monthlyTotal, currency)}
              helper="Se descuentan automaticamente al iniciar cada mes."
            />
          </div>

          {chartData.length > 0 && (
            <section className="rounded-[16px] border-[3px] border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-soft)] sm:rounded-[24px] sm:p-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-black text-[var(--color-foreground)] sm:text-xl">
                  Gastos por Categoría
                </h2>
                <div className="flex gap-1 rounded-[12px] border-[3px] border-[var(--color-border)] bg-[var(--color-elevated)] p-1 sm:gap-2 sm:rounded-[16px]">
                  <button
                    onClick={() => setChartView("variable")}
                    className={`rounded-[8px] px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide transition sm:rounded-[12px] sm:px-4 sm:py-2 sm:text-xs ${
                      chartView === "variable"
                        ? "bg-[var(--color-primary)] text-white shadow-lg"
                        : "text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]"
                    }`}
                  >
                    Solo Variables
                  </button>
                  <button
                    onClick={() => setChartView("all")}
                    className={`rounded-[8px] px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide transition sm:rounded-[12px] sm:px-4 sm:py-2 sm:text-xs ${
                      chartView === "all"
                        ? "bg-[var(--color-primary)] text-white shadow-lg"
                        : "text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]"
                    }`}
                  >
                    Incluye Fijos
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300} className="sm:!h-[400px]">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value, currency)}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "3px solid black",
                      borderRadius: "16px",
                      fontWeight: "bold",
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontWeight: "bold",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </section>
          )}

          <EntriesSection
            categories={categories}
            currency={currency}
            currencyOptions={currencyOptions}
            manager={entriesManager}
          />
        </div>
      ) : (
        <div className="grid gap-6">
          <SettingsForm />
          <ExportButton monthKey={monthKey} entries={entriesManager.entries} onRefresh={entriesManager.refresh} />
          <CategoryManager
            categories={categories}
            onAdd={handleAddCategory}
            onRename={handleRenameCategory}
            onRemove={handleRemoveCategory}
          />
          <FixedExpensesSection
            categories={categories}
            currency={currency}
            manager={fixedExpensesManager}
          />
        </div>
      )}
    </div>
  );
}
