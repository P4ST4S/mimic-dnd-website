"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  TEXTURE_STORAGE_KEY,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme";

function readPreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function readTextureOff(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(TEXTURE_STORAGE_KEY) === "off";
  } catch {
    return false;
  }
}

function resolve(pref: ThemePreference): ResolvedTheme {
  if (pref !== "system") return pref;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: ResolvedTheme) {
  const el = document.documentElement;
  el.setAttribute("data-theme", theme);
  el.style.colorScheme = theme;
}

function applyTexture(off: boolean) {
  const el = document.documentElement;
  if (off) el.setAttribute("data-texture", "off");
  else el.removeAttribute("data-texture");
}

/**
 * Pilote data-theme / data-texture sur <html>. Lit la MÊME source que le
 * script inline anti-flash (src/lib/theme.ts) : l'état React est donc
 * d'emblée cohérent avec le DOM déjà peint, pas de "saut" au montage.
 */
export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>(readPreference);
  const [textureOff, setTextureOffState] = useState<boolean>(readTextureOff);

  // En dev, le remount StrictMode réinitialise <html> aux seuls attributs
  // gérés par React et efface celui posé par le script inline. No-op en
  // prod (documenté dans preventing-flash-before-hydration.md).
  useLayoutEffect(() => {
    applyTheme(resolve(readPreference()));
    applyTexture(readTextureOff());
  }, []);

  // Suivi live de la préférence OS quand l'utilisateur est en mode "système"
  useEffect(() => {
    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(mq.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [preference]);

  // Synchronisation entre onglets ouverts sur le site
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY) {
        const next = readPreference();
        setPreferenceState(next);
        applyTheme(resolve(next));
      }
      if (e.key === TEXTURE_STORAGE_KEY) {
        const off = readTextureOff();
        setTextureOffState(off);
        applyTexture(off);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    try {
      if (next === "system") localStorage.removeItem(THEME_STORAGE_KEY);
      else localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* stockage bloqué (mode privé…) : on applique quand même pour la session */
    }
    setPreferenceState(next);
    applyTheme(resolve(next));
  }, []);

  const setTextureOff = useCallback((off: boolean) => {
    try {
      if (off) localStorage.setItem(TEXTURE_STORAGE_KEY, "off");
      else localStorage.removeItem(TEXTURE_STORAGE_KEY);
    } catch {
      /* idem */
    }
    setTextureOffState(off);
    applyTexture(off);
  }, []);

  return { preference, setPreference, textureOff, setTextureOff };
}
