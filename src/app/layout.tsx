import type { Metadata, Viewport } from "next";
import {
  Cinzel,
  Cinzel_Decorative,
  EB_Garamond,
  Fondamento,
  JetBrains_Mono,
} from "next/font/google";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const display = Cinzel({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const displayOrnate = Cinzel_Decorative({
  variable: "--font-display-ornate",
  weight: ["400", "700"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const body = EB_Garamond({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  display: "swap",
});

const flavor = Fondamento({
  variable: "--font-flavor",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Mimic — Compagnon de campagne", template: "%s · Mimic" },
  description:
    "Fiches de personnage, inventaire et informations de campagne pour notre table de D&D 5e.",
};

// Empêche la barre d'URL mobile de rester blanche sur le thème grimoire.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e8d9b8" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1714" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      data-theme="light"
      suppressHydrationWarning
      className={`${display.variable} ${displayOrnate.variable} ${body.variable} ${flavor.variable} ${mono.variable}`}
    >
      <head>
        {/* Anti-flash : pose data-theme AVANT la première peinture.
            Voir node_modules/next/dist/docs/01-app/02-guides/
            preventing-flash-before-hydration.md */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="surface-parchment min-h-screen text-text font-body antialiased">
        {children}
      </body>
    </html>
  );
}
