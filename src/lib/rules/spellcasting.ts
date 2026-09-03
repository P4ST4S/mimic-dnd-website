import { abilityModifier, proficiencyBonus, type AbilityKey } from "./abilities";

export type CasterType = "full" | "half" | "third" | "pact" | "none";

/**
 * Contribution d'une classe au niveau de lanceur multiclasse (PHB p.164) :
 * pleins lanceurs comptent en entier, demi-lanceurs de moitié (arrondi bas),
 * tiers-lanceurs au tiers (arrondi bas). Le Sorcier (magie de pacte) est
 * TOUJOURS exclu de ce calcul — ses emplacements sont gérés séparément
 * (voir SpellSlot.kind = "pact" dans le schéma Prisma).
 */
export function casterLevelContribution(type: CasterType, classLevel: number): number {
  switch (type) {
    case "full":
      return classLevel;
    case "half":
      return Math.floor(classLevel / 2);
    case "third":
      return Math.floor(classLevel / 3);
    default:
      return 0;
  }
}

export function multiclassCasterLevel(
  classes: readonly { casterType: CasterType; level: number }[],
): number {
  return classes.reduce(
    (sum, c) => sum + casterLevelContribution(c.casterType, c.level),
    0,
  );
}

/** DD de sauvegarde des sorts = 8 + bonus de maîtrise + mod. de la caractéristique d'incantation. */
export function spellSaveDC(
  castingAbilityScore: number,
  totalCharacterLevel: number,
): number {
  return 8 + proficiencyBonus(totalCharacterLevel) + abilityModifier(castingAbilityScore);
}

/** Bonus d'attaque de sorts = bonus de maîtrise + mod. de la caractéristique d'incantation. */
export function spellAttackBonus(
  castingAbilityScore: number,
  totalCharacterLevel: number,
): number {
  return proficiencyBonus(totalCharacterLevel) + abilityModifier(castingAbilityScore);
}

export const CASTING_ABILITY_BY_CLASS: Record<string, AbilityKey> = {
  bard: "cha",
  cleric: "wis",
  druid: "wis",
  paladin: "cha",
  ranger: "wis",
  sorcerer: "cha",
  warlock: "cha",
  wizard: "int",
  "eldritch-knight": "int",
  "arcane-trickster": "int",
};

/**
 * Emplacements de sorts par niveau de lanceur (niveaux de sort 1 à 9),
 * table "Multiclass Spellcaster" du PHB — identique à la table de pleins
 * lanceurs, indexée par le niveau de lanceur composite calculé ci-dessus.
 * Index 0 = niveau de sort 1, ... index 8 = niveau de sort 9.
 */
const FULL_CASTER_SLOT_TABLE: readonly (readonly number[])[] = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1],
];

/** Renvoie les emplacements [niv.1 .. niv.9] pour un niveau de lanceur composite (0-20). */
export function spellSlotsForCasterLevel(casterLevel: number): readonly number[] {
  if (casterLevel <= 0) return [0, 0, 0, 0, 0, 0, 0, 0, 0];
  const row = FULL_CASTER_SLOT_TABLE[Math.min(casterLevel, 20) - 1];
  return row;
}

/**
 * Emplacements de la magie de pacte (Sorcier) — indépendants du calcul
 * multiclasse ci-dessus. Table PHB p.107.
 */
const PACT_MAGIC_TABLE: readonly { slots: number; level: number }[] = [
  { slots: 1, level: 1 },
  { slots: 2, level: 1 },
  { slots: 2, level: 2 },
  { slots: 2, level: 2 },
  { slots: 2, level: 3 },
  { slots: 2, level: 3 },
  { slots: 2, level: 4 },
  { slots: 2, level: 4 },
  { slots: 2, level: 5 },
  { slots: 2, level: 5 },
  { slots: 3, level: 5 },
  { slots: 3, level: 5 },
  { slots: 3, level: 5 },
  { slots: 3, level: 5 },
  { slots: 3, level: 5 },
  { slots: 3, level: 5 },
  { slots: 4, level: 5 },
  { slots: 4, level: 5 },
  { slots: 4, level: 5 },
  { slots: 4, level: 5 },
];

export function pactMagicSlots(warlockLevel: number): { slots: number; level: number } {
  if (warlockLevel <= 0) return { slots: 0, level: 0 };
  return PACT_MAGIC_TABLE[Math.min(warlockLevel, 20) - 1];
}
