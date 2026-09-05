/**
 * Valeurs par défaut des classes 5e utilisées par le seed pour générer des
 * personnages jouables sans que seed.data.json doive tout détailler.
 * Source : SRD 5.1 (PHB). Pas exhaustif — complète au besoin.
 */
export interface ClassDefaults {
  label: string;
  hitDie: 6 | 8 | 10 | 12;
  savingThrows: string[]; // slugs "str" | "dex" | "con" | "int" | "wis" | "cha"
  skills: string[]; // 2-4 compétences de départ typiques, pour peupler le seed
  casterType: "full" | "half" | "third" | "pact" | "none";
  spellcastingAbility?: "int" | "wis" | "cha";
}

export const CLASS_DEFAULTS: Record<string, ClassDefaults> = {
  // Hors SRD 5.1 de base (Tasha's Cauldron of Everything / Eberron) — pas
  // dans le PHB, mais nécessaire pour les personnages du groupe qui en jouent.
  artificer: {
    label: "Artificier",
    hitDie: 8,
    savingThrows: ["con", "int"],
    skills: ["arcana", "investigation"],
    casterType: "half",
    spellcastingAbility: "int",
  },
  barbarian: {
    label: "Barbare",
    hitDie: 12,
    savingThrows: ["str", "con"],
    skills: ["athletics", "intimidation"],
    casterType: "none",
  },
  bard: {
    label: "Barde",
    hitDie: 8,
    savingThrows: ["dex", "cha"],
    skills: ["performance", "persuasion"],
    casterType: "full",
    spellcastingAbility: "cha",
  },
  cleric: {
    label: "Clerc",
    hitDie: 8,
    savingThrows: ["wis", "cha"],
    skills: ["religion", "insight"],
    casterType: "full",
    spellcastingAbility: "wis",
  },
  druid: {
    label: "Druide",
    hitDie: 8,
    savingThrows: ["int", "wis"],
    skills: ["nature", "survival"],
    casterType: "full",
    spellcastingAbility: "wis",
  },
  fighter: {
    label: "Guerrier",
    hitDie: 10,
    savingThrows: ["str", "con"],
    skills: ["athletics", "perception"],
    casterType: "none",
  },
  monk: {
    label: "Moine",
    hitDie: 8,
    savingThrows: ["str", "dex"],
    skills: ["acrobatics", "stealth"],
    casterType: "none",
  },
  paladin: {
    label: "Paladin",
    hitDie: 10,
    savingThrows: ["wis", "cha"],
    skills: ["persuasion", "athletics"],
    casterType: "half",
    spellcastingAbility: "cha",
  },
  ranger: {
    label: "Rôdeur",
    hitDie: 10,
    savingThrows: ["str", "dex"],
    skills: ["survival", "stealth"],
    casterType: "half",
    spellcastingAbility: "wis",
  },
  rogue: {
    label: "Roublard",
    hitDie: 8,
    savingThrows: ["dex", "int"],
    skills: ["stealth", "sleight-of-hand"],
    casterType: "none",
  },
  sorcerer: {
    label: "Ensorceleur",
    hitDie: 6,
    savingThrows: ["con", "cha"],
    skills: ["arcana", "persuasion"],
    casterType: "full",
    spellcastingAbility: "cha",
  },
  warlock: {
    label: "Occultiste",
    hitDie: 8,
    savingThrows: ["wis", "cha"],
    skills: ["arcana", "deception"],
    casterType: "pact",
    spellcastingAbility: "cha",
  },
  wizard: {
    label: "Magicien",
    hitDie: 6,
    savingThrows: ["int", "wis"],
    skills: ["arcana", "history"],
    casterType: "full",
    spellcastingAbility: "int",
  },
};
