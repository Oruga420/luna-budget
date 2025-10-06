"use client";

import { Home, Settings } from "lucide-react";

interface NavigationProps {
  currentPage: "home" | "settings";
  onNavigate: (page: "home" | "settings") => void;
}

export const Navigation = ({ currentPage, onNavigate }: NavigationProps) => {
  return (
    <nav className="mb-4 flex gap-1.5 rounded-[16px] border-[3px] border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-[var(--shadow-soft)] sm:mb-6 sm:gap-2 sm:rounded-[20px] sm:p-2 lg:mb-8 lg:rounded-[24px]">
      <button
        onClick={() => onNavigate("home")}
        className={`flex flex-1 items-center justify-center gap-1.5 rounded-[12px] px-3 py-2.5 text-xs font-bold uppercase tracking-wide transition sm:gap-2 sm:rounded-[14px] sm:px-4 sm:py-3 sm:text-sm lg:rounded-[16px] lg:px-6 ${
          currentPage === "home"
            ? "bg-[var(--color-primary)] text-white shadow-lg"
            : "text-[var(--color-foreground-muted)] hover:bg-[var(--color-elevated)] hover:text-[var(--color-foreground)]"
        }`}
      >
        <Home className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="hidden xs:inline sm:inline">Dashboard</span>
        <span className="inline xs:hidden sm:hidden">Inicio</span>
      </button>
      <button
        onClick={() => onNavigate("settings")}
        className={`flex flex-1 items-center justify-center gap-1.5 rounded-[12px] px-3 py-2.5 text-xs font-bold uppercase tracking-wide transition sm:gap-2 sm:rounded-[14px] sm:px-4 sm:py-3 sm:text-sm lg:rounded-[16px] lg:px-6 ${
          currentPage === "settings"
            ? "bg-[var(--color-primary)] text-white shadow-lg"
            : "text-[var(--color-foreground-muted)] hover:bg-[var(--color-elevated)] hover:text-[var(--color-foreground)]"
        }`}
      >
        <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="hidden xs:inline sm:inline">Configuración</span>
        <span className="inline xs:hidden sm:hidden">Config</span>
      </button>
    </nav>
  );
};
