const memoryStore = new Map<string, unknown>();

const isBrowser = () => typeof window !== "undefined";

export const getLocalValue = <T>(key: string, fallback: T): T => {
  if (isBrowser()) {
    try {
      const value = window.localStorage.getItem(key);
      if (value === null) return fallback;
      return JSON.parse(value) as T;
    } catch (error) {
      console.warn("localStorage read failed", error);
      return fallback;
    }
  }

  return (memoryStore.get(key) as T) ?? fallback;
};

export const setLocalValue = <T>(key: string, value: T) => {
  if (isBrowser()) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn("localStorage write failed", error);
    }
    return;
  }

  memoryStore.set(key, value);
};

export const removeLocalValue = (key: string) => {
  if (isBrowser()) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn("localStorage remove failed", error);
    }
    return;
  }

  memoryStore.delete(key);
};
