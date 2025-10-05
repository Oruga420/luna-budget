import "fake-indexeddb/auto";
import { randomUUID } from "node:crypto";

if (typeof globalThis.crypto === "undefined") {
  Object.defineProperty(globalThis, "crypto", {
    value: { randomUUID },
    configurable: true,
  });
} else if (typeof globalThis.crypto.randomUUID !== "function") {
  globalThis.crypto.randomUUID = randomUUID;
}
