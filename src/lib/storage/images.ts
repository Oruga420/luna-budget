import type { StoredImage } from "../../domain/types";
import { getBudgetDB } from "./db";
import { createId } from "../utils/id";

export interface ImageInput {
  id?: string;
  blob: Blob;
  ttlDays?: number | null;
}

const computeExpiry = (ttlDays?: number | null) => {
  if (!ttlDays || Number.isNaN(ttlDays)) {
    return null;
  }

  const expires = new Date();
  expires.setDate(expires.getDate() + ttlDays);
  return expires.toISOString();
};

export const saveImage = async (input: ImageInput): Promise<StoredImage> => {
  const db = await getBudgetDB();
  const nowIso = new Date().toISOString();
  const id = input.id ?? createId();
  const record: StoredImage = {
    id,
    blob: input.blob,
    createdAt: nowIso,
    expiresAt: computeExpiry(input.ttlDays ?? null),
  };

  await db.put("images", record);
  return record;
};

export const getImage = async (id: string) => {
  const db = await getBudgetDB();
  return db.get("images", id);
};

export const deleteImage = async (id: string) => {
  const db = await getBudgetDB();
  await db.delete("images", id);
};

export const purgeExpiredImages = async () => {
  const db = await getBudgetDB();
  const tx = db.transaction("images", "readwrite");
  let cursor = await tx.store.openCursor();
  const now = Date.now();

  while (cursor) {
    const expiresAt = cursor.value.expiresAt
      ? Date.parse(cursor.value.expiresAt)
      : null;

    if (expiresAt && expiresAt <= now) {
      await cursor.delete();
    }

    cursor = await cursor.continue();
  }

  await tx.done;
};
