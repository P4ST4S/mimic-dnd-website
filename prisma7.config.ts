// Configuration Prisma 7 — remplace le champ "prisma" de package.json
// (supprimé en v7). Le nom de fichier "prisma7.config.ts" est celui que
// la CLI Prisma 7.10 attend par défaut (vérifié via `prisma init`), pas
// "prisma.config.ts".
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Le seed ne tourne plus automatiquement avec `migrate dev` / `reset`
    // en Prisma 7 : toujours l'invoquer explicitement avec `prisma db seed`.
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Les migrations exigent une connexion DIRECTE (non poolée) — c'est la
    // variable DATABASE_URL_UNPOOLED fournie par l'intégration Vercel⇄Neon.
    // L'app en runtime utilise DATABASE_URL (poolée) via src/lib/db.ts.
    url: env("DATABASE_URL_UNPOOLED"),
  },
});
