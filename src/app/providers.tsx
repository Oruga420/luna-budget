"use client";

import type { ReactNode } from "react";
import { SettingsProvider } from "../state/settings-context";

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <SettingsProvider>{children}</SettingsProvider>
);
