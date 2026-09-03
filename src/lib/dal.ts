import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "./db";
import { readSessionCookie, type SessionPayload } from "./session";
import { Role } from "@/generated/prisma/enums";

/**
 * Barrière d'autorisation RÉELLE du site (voir ARCHITECTURE.md § "La règle
 * d'or"). `src/proxy.ts` ne fait que des redirections optimistes ; c'est
 * cette fonction — appelée depuis chaque fonction de `src/data/` — qui
 * décide vraiment. Mémoïsée par requête via `cache()` (React), comme
 * recommandé par node_modules/next/dist/docs/01-app/02-guides/authentication.md.
 */
export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await readSessionCookie();
  if (!session?.userId) {
    redirect("/login");
  }
  return session;
});

/** Variante qui ne redirige pas — pour les endroits où "non connecté" est un état valide. */
export const getOptionalSession = cache(async (): Promise<SessionPayload | null> => {
  return readSessionCookie();
});

export const getCurrentUser = cache(async () => {
  const session = await verifySession();
  const user = await db.user.findUnique({
    where: { id: session.userId, isActive: true },
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
      mustChangePassword: true,
    },
  });
  if (!user) {
    redirect("/login");
  }
  return user;
});

export async function requireDm() {
  const user = await getCurrentUser();
  if (user.role !== Role.DM) {
    redirect("/");
  }
  return user;
}

/**
 * Vrai si l'utilisateur courant peut éditer ce personnage : son
 * propriétaire, ou le MJ. Centralisé ici pour que chaque Server Action
 * d'édition (personnage, inventaire, bio) applique EXACTEMENT la même règle.
 */
export async function assertCanEditCharacter(characterOwnerId: string) {
  const user = await getCurrentUser();
  if (user.role === Role.DM || user.id === characterOwnerId) {
    return user;
  }
  redirect("/");
}
