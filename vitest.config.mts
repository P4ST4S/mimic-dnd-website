import { defineConfig } from "vitest/config";
import path from "node:path";

const __dirname = import.meta.dirname;

/**
 * Vitest cible uniquement `src/lib/rules/` (formules 5e pures, sans I/O) —
 * voir ARCHITECTURE.md : c'est la seule partie du projet qui mérite des
 * tests unitaires, le reste étant soit de l'UI, soit des requêtes Prisma
 * qu'il faudrait mocker pour un bénéfice limité sur un projet de 6 comptes.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    include: ["src/lib/rules/**/*.test.ts"],
    environment: "node",
  },
});
