import "server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

/**
 * Singleton Prisma, gardé sur `globalThis` : sans cette garde, le HMR de
 * `next dev` recréerait un PrismaClient (et donc une connexion Neon) à
 * chaque sauvegarde de fichier. Voir docs/RUNBOOK.md.
 *
 * L'adaptateur Neon consomme DATABASE_URL (la chaîne *pooled*) — pas
 * DATABASE_URL_UNPOOLED, réservée aux migrations (voir prisma7.config.ts).
 */
declare global {
  var __prisma: PrismaClient | undefined;
}

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL manquante. Copiez .env.example vers .env et renseignez " +
        "la chaîne de connexion Neon (voir docs/RUNBOOK.md).",
    );
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

export const db = globalThis.__prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = db;
}
