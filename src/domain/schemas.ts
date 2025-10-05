import { z } from "zod";

export const categoryNameSchema = z
  .string()
  .trim()
  .min(1, "Ingresa un nombre")
  .max(32, "Nombre demasiado largo");

export const entryFormSchema = z
  .object({
    id: z.string().optional(),
    itemName: z.string().trim().min(1, "Ingresa un nombre").max(80),
    amount: z.coerce
      .number({ invalid_type_error: "Ingresa un monto valido" })
      .min(0, "El monto no puede ser negativo"),
    currency: z.string().trim().min(1, "Selecciona una moneda"),
    category: z.string().trim().min(1, "Selecciona una categoria"),
    type: z.enum(["fixed", "variable"], {
      invalid_type_error: "Selecciona un tipo",
    }),
    date: z
      .string()
      .trim()
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: "Fecha invalida",
      }),
    notes: z
      .string()
      .trim()
      .max(240, "Notas demasiado largas")
      .optional()
      .nullable(),
  })
  .transform((data) => ({
    ...data,
    itemName: data.itemName.trim(),
    category: data.category.trim(),
    notes: data.notes ? data.notes.trim() : null,
  }));

export type EntryFormData = z.infer<typeof entryFormSchema>;

export const fixedExpenseFormSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().trim().min(1, "Ingresa un nombre").max(80),
    amount: z.coerce
      .number({ invalid_type_error: "Ingresa un monto valido" })
      .min(0, "El monto no puede ser negativo"),
    category: z.string().trim().min(1, "Selecciona una categoria"),
    billingDay: z
      .union([z.coerce.number(), z.null(), z.undefined()])
      .refine(
        (value) =>
          value === null ||
          typeof value === "undefined" ||
          (Number.isInteger(value) && value >= 1 && value <= 31),
        {
          message: "El dia de cobro debe estar entre 1 y 31",
        },
      )
      .transform((value) =>
        value === null || typeof value === "undefined" ? null : Math.trunc(value),
      ),
    notes: z
      .string()
      .trim()
      .max(240, "Notas demasiado largas")
      .optional()
      .nullable(),
  })
  .transform((data) => ({
    ...data,
    name: data.name.trim(),
    category: data.category.trim(),
    notes: data.notes ? data.notes.trim() : null,
  }));

export type FixedExpenseFormData = z.infer<typeof fixedExpenseFormSchema>;
