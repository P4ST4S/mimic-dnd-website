/**
 * Source de vérité du système de thème (clair "Parchemin" / sombre "Grimoire").
 *
 * Ce module est importé à la fois par le script anti-flash (exécuté tel
 * quel dans un <script> côté serveur, voir layout.tsx) et par le hook
 * client `useTheme` (src/components/theme/use-theme.ts) : les deux DOIVENT
 * lire exactement la même clé de stockage et la même logique de résolution,
 * sinon le rendu serveur et le premier rendu client divergent.
 *
 * Pas de "use client" ici : ce fichier ne touche ni le DOM ni window au
 * chargement, seulement à l'exécution des fonctions qu'il exporte.
 */

export const THEME_STORAGE_KEY = "mimic-theme";
export const TEXTURE_STORAGE_KEY = "mimic-texture";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_LABELS: Record<ThemePreference, string> = {
  light: "Parchemin",
  dark: "Grimoire",
  system: "Système",
};

/**
 * Script inline injecté dans <head>, exécuté pendant le parsing HTML donc
 * avant la première peinture (voir node_modules/next/dist/docs/01-app/
 * 02-guides/preventing-flash-before-hydration.md). Doit rester ES5 strict,
 * sans dépendance, et défensif (try/catch) : le mode privé de certains
 * navigateurs jette sur localStorage.getItem.
 */
export const THEME_INIT_SCRIPT = `(function(){try{
var k=${JSON.stringify(THEME_STORAGE_KEY)};
var p=localStorage.getItem(k);
if(p!=="light"&&p!=="dark")p="system";
var t=p==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p;
var e=document.documentElement;
e.setAttribute("data-theme",t);
e.style.colorScheme=t;
var tx=localStorage.getItem(${JSON.stringify(TEXTURE_STORAGE_KEY)});
if(tx==="off")e.setAttribute("data-texture","off");
}catch(err){}})()`;
