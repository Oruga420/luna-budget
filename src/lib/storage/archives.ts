import type { ArchiveMetadata } from "../../domain/types";
import { getBudgetDB } from "./db";

export const listArchives = async (): Promise<ArchiveMetadata[]> => {
  const db = await getBudgetDB();
  return db.getAll("archives");
};

export const getArchiveMetadata = async (
  monthKey: string,
): Promise<ArchiveMetadata | undefined> => {
  const db = await getBudgetDB();
  return db.get("archives", monthKey);
};

export const saveArchiveMetadata = async (meta: ArchiveMetadata) => {
  const db = await getBudgetDB();
  await db.put("archives", meta);
};

export const deleteArchiveMetadata = async (monthKey: string) => {
  const db = await getBudgetDB();
  await db.delete("archives", monthKey);
};
