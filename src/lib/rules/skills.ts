import type { AbilityKey } from "./abilities";

/**
 * Les 18 compétences 5e. `index` est le slug anglais canonique (clé stable
 * en base et vers le SRD, voir docs/DATA_MODEL.md §"charnière i18n") ;
 * `label` est la traduction officielle française.
 */
export interface SkillDefinition {
  index: string;
  label: string;
  ability: AbilityKey;
}

export const SKILLS: readonly SkillDefinition[] = [
  { index: "acrobatics", label: "Acrobaties", ability: "dex" },
  { index: "animal-handling", label: "Dressage", ability: "wis" },
  { index: "arcana", label: "Arcanes", ability: "int" },
  { index: "athletics", label: "Athlétisme", ability: "str" },
  { index: "deception", label: "Tromperie", ability: "cha" },
  { index: "history", label: "Histoire", ability: "int" },
  { index: "insight", label: "Perspicacité", ability: "wis" },
  { index: "intimidation", label: "Intimidation", ability: "cha" },
  { index: "investigation", label: "Investigation", ability: "int" },
  { index: "medicine", label: "Médecine", ability: "wis" },
  { index: "nature", label: "Nature", ability: "int" },
  { index: "perception", label: "Perception", ability: "wis" },
  { index: "performance", label: "Représentation", ability: "cha" },
  { index: "persuasion", label: "Persuasion", ability: "cha" },
  { index: "religion", label: "Religion", ability: "int" },
  { index: "sleight-of-hand", label: "Escamotage", ability: "dex" },
  { index: "stealth", label: "Discrétion", ability: "dex" },
  { index: "survival", label: "Survie", ability: "wis" },
];

export function findSkill(index: string): SkillDefinition | undefined {
  return SKILLS.find((s) => s.index === index);
}
