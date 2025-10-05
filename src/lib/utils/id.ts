const randomFromMath = () =>
  Math.random().toString(36).replace(/[^a-z0-9]+/gi, "").slice(0, 10);

export const createId = () => {
  const cryptoRef: Crypto | undefined =
    typeof globalThis !== "undefined" ? (globalThis as typeof globalThis & { crypto?: Crypto }).crypto : undefined;

  if (cryptoRef?.randomUUID) {
    return cryptoRef.randomUUID();
  }

  return randomFromMath();
};
