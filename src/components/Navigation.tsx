"use client";

import { Home, Settings } from "lucide-react";

interface NavigationProps {
  currentPage: "home" | "settings";
  onNavigate: (page: "home" | "settings") => void;
}

export const Navigation = ({ currentPage, onNavigate }: NavigationProps) => {
  return (
    <nav className="mb-8 flex gap-4 rounded-[24px] border-[3px] border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-[var(--shadow-soft)]">
      <button
        onClick={() => onNavigate("home")}
        className={`flex flex-1 items-center justify-center gap-2 rounded-[16px] px-6 py-3 text-sm font-bold uppercase tracking-wide transition ${
          currentPage === "home"
            ? "bg-[var(--color-primary)] text-white shadow-lg"
            : "text-[var(--color-foreground-muted)] hover:bg-[var(--color-elevated)] hover:text-[var(--color-foreground)]"
        }`}
      >
        <Home className="h-5 w-5" />
        Dashboard
      </button>
      <button
        onClick={() => onNavigate("settings")}
        className={`flex flex-1 items-center justify-center gap-2 rounded-[16px] px-6 py-3 text-sm font-bold uppercase tracking-wide transition ${
          currentPage === "settings"
            ? "bg-[var(--color-primary)] text-white shadow-lg"
            : "text-[var(--color-foreground-muted)] hover:bg-[var(--color-elevated)] hover:text-[var(--color-foreground)]"
        }`}
      >
        <Settings className="h-5 w-5" />
        Configuración
      </button>
    </nav>
  );
};
