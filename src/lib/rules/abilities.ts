/**
 * Formules D&D 5e pures, sans I/O — testables sans base de données.
 * C'est le cœur métier du site : voir docs/ARCHITECTURE.md §3.
 */

export const ABILITY_KEYS = ["str", "dex", "con", "int", "wis", "cha"] as const;
export type AbilityKey = (typeof ABILITY_KEYS)[number];

export const ABILITY_LABELS_FR: Record<AbilityKey, { long: string; short: string }> = {
  str: { long: "Force", short: "FOR" },
  dex: { long: "Dextérité", short: "DEX" },
  con: { long: "Constitution", short: "CON" },
  int: { long: "Intelligence", short: "INT" },
  wis: { long: "Sagesse", short: "SAG" },
  cha: { long: "Charisme", short: "CHA" },
};

/** Modificateur d'une caractéristique : floor((score - 10) / 2). */
export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Bonus de maîtrise : dépend du niveau TOTAL du personnage (somme des
 * niveaux de classe en cas de multiclassage), pas du niveau d'une classe.
 * Table 5e : +2 aux niveaux 1-4, +3 aux niveaux 5-8, etc.
 */
export function proficiencyBonus(totalLevel: number): number {
  return Math.floor((Math.max(1, totalLevel) - 1) / 4) + 2;
}

/** Formate un modificateur avec son signe : 3 -> "+3", -1 -> "-1", 0 -> "+0". */
export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

/** Bonus d'une compétence : mod de caractéristique + (0, 1 ou 2 × bonus de maîtrise). */
export function skillBonus(
  abilityScore: number,
  totalLevel: number,
  proficiency: "none" | "proficient" | "expert",
): number {
  const mult = proficiency === "expert" ? 2 : proficiency === "proficient" ? 1 : 0;
  return abilityModifier(abilityScore) + mult * proficiencyBonus(totalLevel);
}

/** Perception passive = 10 + bonus de Sagesse (Perception). */
export function passivePerception(
  wisdomScore: number,
  totalLevel: number,
  proficiency: "none" | "proficient" | "expert",
): number {
  return 10 + skillBonus(wisdomScore, totalLevel, proficiency);
}
