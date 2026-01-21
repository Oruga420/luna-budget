import {
  pgTable,
  text,
  decimal,
  timestamp,
  uuid,
  integer,
  date,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const allowedUsers = pgTable("allowed_users", {
  email: text("email").primaryKey(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email")
    .notNull()
    .unique()
    .references(() => allowedUsers.email),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const settings = pgTable("settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull().default("0"),
  savingsGoal: decimal("savings_goal", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  alertThresholdPct: decimal("alert_threshold_pct", { precision: 5, scale: 2 })
    .notNull()
    .default("0.8"),
  currency: varchar("currency", { length: 3 }).notNull().default("CAD"),
  // categories stored as text array in Postgres, handled as string[] in TS
  categories: text("categories")
    .array()
    .default(
      sql`ARRAY['renta', 'comida', 'transporte', 'entretenimiento', 'otros']::text[]`,
    ),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const fixedExpenses = pgTable("fixed_expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  category: text("category").notNull(),
  billingDay: integer("billing_day"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const entries = pgTable("entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  itemName: text("item_name").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  category: text("category").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'fixed' | 'variable'
  dateIso: date("date_iso").notNull(),
  notes: text("notes"),
  source: varchar("source", { length: 20 }).default("manual"), // 'manual' | 'image'
  imageRef: text("image_ref"),
  monthKey: varchar("month_key", { length: 7 }).notNull(), // YYYY-MM
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
