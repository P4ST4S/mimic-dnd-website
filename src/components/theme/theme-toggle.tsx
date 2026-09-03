"use client";

import { THEME_LABELS, type ThemePreference } from "@/lib/theme";
import { useTheme } from "./use-theme";

const OPTIONS: readonly ThemePreference[] = ["light", "dark", "system"] as const;

const ICONS: Record<ThemePreference, string> = {
  light: "☀",
  dark: "☾",
  system: "⌂",
};

export function ThemeToggle() {
  const { preference, setPreference } = useTheme();

  return (
    <fieldset
      className="inline-flex items-stretch rounded-sheet border border-border bg-surface-sunken p-px"
      suppressHydrationWarning
    >
      <legend className="sr-only">Thème d’affichage</legend>
      {OPTIONS.map((opt) => {
        const active = preference === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => setPreference(opt)}
            aria-pressed={active}
            title={THEME_LABELS[opt]}
            suppressHydrationWarning
            className={[
              "font-display text-2xs tracking-[0.14em] uppercase",
              "px-3 py-1.5 transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
              active
                ? "bg-accent text-on-accent shadow-[var(--shadow-vellum)]"
                : "text-text-muted hover:bg-surface-raised hover:text-text",
            ].join(" ")}
          >
            <span aria-hidden="true" className="mr-1.5">
              {ICONS[opt]}
            </span>
            {THEME_LABELS[opt]}
          </button>
        );
      })}
    </fieldset>
  );
}
