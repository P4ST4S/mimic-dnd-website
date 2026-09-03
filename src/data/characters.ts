import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { assertCanEditCharacter, getCurrentUser, requireDm } from "@/lib/dal";
import { Role, Visibility, CharacterKind } from "@/generated/prisma/enums";

const FULL_CHARACTER_INCLUDE = {
  classes: { orderBy: { order: "asc" as const } },
  skills: true,
  proficiencies: { orderBy: { order: "asc" as const } },
  features: { orderBy: { order: "asc" as const } },
  spells: { orderBy: { order: "asc" as const } },
  spellSlots: true,
  items: { orderBy: { order: "asc" as const } },
  bio: true,
  owner: { select: { id: true, displayName: true } },
};

/** Le roster : tous les personnages joueurs, pour la page d'accueil. */
export const listRosterCharacters = cache(async () => {
  await getCurrentUser(); // exige une session — voir dal.ts
  return db.character.findMany({
    where: { kind: CharacterKind.PC },
    orderBy: { name: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      raceLabel: true,
      portraitUrl: true,
      hpCurrent: true,
      hpMax: true,
      hpTemp: true,
      owner: { select: { displayName: true } },
      classes: { select: { classLabel: true, level: true }, orderBy: { order: "asc" } },
    },
  });
});

/** Fiche complète, en lecture — visible par tout compte connecté. */
export const getCharacterBySlug = cache(async (slug: string) => {
  const user = await getCurrentUser();
  const character = await db.character.findUnique({
    where: { slug },
    include: {
      ...FULL_CHARACTER_INCLUDE,
      notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { displayName: true } } } },
    },
  });
  if (!character) return null;

  const isOwner = character.ownerId === user.id;
  const isDm = user.role === Role.DM;

  // Filtrage de visibilité — fait ICI, dans le DAL, jamais dans le composant.
  const notes = character.notes.filter((note) => {
    if (note.visibility === Visibility.PARTY) return true;
    if (note.visibility === Visibility.PRIVATE) return isOwner || isDm;
    if (note.visibility === Visibility.DM_ONLY) return isDm;
    return true; // PUBLIC
  });
  const items = character.items.filter((item) => {
    if (item.visibility === Visibility.PARTY) return true;
    if (item.visibility === Visibility.PRIVATE) return isOwner || isDm;
    if (item.visibility === Visibility.DM_ONLY) return isDm;
    return true;
  });
  const features = character.features.filter((f) => {
    if (f.visibility === Visibility.PARTY) return true;
    if (f.visibility === Visibility.PRIVATE) return isOwner || isDm;
    if (f.visibility === Visibility.DM_ONLY) return isDm;
    return true;
  });

  return { ...character, notes, items, features, isOwner, canEdit: isOwner || isDm };
});

/** Le(s) personnage(s) du joueur courant — v1 : un seul en pratique. */
export const listOwnCharacters = cache(async () => {
  const user = await getCurrentUser();
  return db.character.findMany({
    where: { ownerId: user.id, kind: CharacterKind.PC },
    orderBy: { name: "asc" },
    select: { id: true, slug: true, name: true },
  });
});

export async function getCharacterForEdit(characterId: string) {
  const user = await getCurrentUser();
  const character = await db.character.findUnique({
    where: { id: characterId },
    include: FULL_CHARACTER_INCLUDE,
  });
  if (!character) return null;
  if (character.ownerId !== user.id && user.role !== Role.DM) return null;
  return character;
}

/** Tout le groupe — réservé au MJ (voir dal.ts requireDm). */
export const listAllCharactersForDm = cache(async () => {
  await requireDm();
  return db.character.findMany({
    where: { kind: CharacterKind.PC },
    orderBy: { name: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      portraitUrl: true,
      hpCurrent: true,
      hpMax: true,
      owner: { select: { displayName: true, email: true } },
      classes: { select: { classLabel: true, level: true } },
    },
  });
});

export interface AbilityScoresInput {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export async function updateCharacterAbilities(
  characterId: string,
  scores: AbilityScoresInput,
) {
  const character = await db.character.findUnique({
    where: { id: characterId },
    select: { ownerId: true },
  });
  if (!character) throw new Error("Personnage introuvable.");
  await assertCanEditCharacter(character.ownerId);

  return db.character.update({ where: { id: characterId }, data: scores });
}

export interface CombatStateInput {
  hpCurrent: number;
  hpMax: number;
  hpTemp: number;
  armorClass: number;
  inspiration: boolean;
}

export async function updateCharacterCombat(characterId: string, input: CombatStateInput) {
  const character = await db.character.findUnique({
    where: { id: characterId },
    select: { ownerId: true },
  });
  if (!character) throw new Error("Personnage introuvable.");
  await assertCanEditCharacter(character.ownerId);

  return db.character.update({ where: { id: characterId }, data: input });
}
