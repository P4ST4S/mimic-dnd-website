import "server-only";
import spellsData from "./fr/spells.json";
import equipmentData from "./fr/equipment.json";
import skillsData from "./fr/skills.json";
import conditionsData from "./fr/conditions.json";
import classesData from "./fr/classes.json";
import racesData from "./fr/races.json";
import backgroundsData from "./fr/backgrounds.json";
import alignmentsData from "./fr/alignments.json";
import languagesData from "./fr/languages.json";

/**
 * Index en mémoire du SRD 5.1 FR vendorisé (voir scripts/fetch-srd.ts).
 * `server-only` : ce module ne doit JAMAIS atteindre le client — les
 * données transitent uniquement via une Server Action ou un Route Handler
 * qui ne renvoie que les résultats de recherche, pas le JSON complet.
 */

export interface SrdSpell {
  index: string;
  name: string;
  level: number;
  school: { index: string; name: string } | null;
  castingTime: string;
  range: string;
  components: string[];
  material: string | null;
  duration: string;
  concentration: boolean;
  ritual: boolean;
  desc: string[];
  higherLevel: string[];
  classes: { index: string; name: string }[];
}

export interface SrdEquipment {
  index: string;
  name: string;
  category: { index: string; name: string } | null;
  cost: { quantity: number; unit: string } | null;
  weightLb: number | null;
  damage: { dice: string; type: { index: string; name: string } | null } | null;
  armorClass: { base: number; dex_bonus: boolean; max_bonus?: number } | null;
  properties: { index: string; name: string }[];
  desc: string[];
}

const spells = spellsData as SrdSpell[];
const equipment = equipmentData as SrdEquipment[];

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // enlève les accents pour une recherche insensible
    .toLowerCase();
}

/** Recherche par préfixe/sous-chaîne sur le nom français, insensible aux accents. */
export function searchSpells(query: string, limit = 20): SrdSpell[] {
  const q = normalize(query.trim());
  if (!q) return [];
  return spells.filter((s) => normalize(s.name).includes(q)).slice(0, limit);
}

export function searchEquipment(query: string, limit = 20): SrdEquipment[] {
  const q = normalize(query.trim());
  if (!q) return [];
  return equipment.filter((e) => normalize(e.name).includes(q)).slice(0, limit);
}

/** Tous les noms d'équipement du SRD, pour peupler une <datalist>. */
export function listAllEquipmentNames(): string[] {
  return equipment.map((e) => e.name);
}

export function getSpellByIndex(index: string): SrdSpell | undefined {
  return spells.find((s) => s.index === index);
}

export function getEquipmentByIndex(index: string): SrdEquipment | undefined {
  return equipment.find((e) => e.index === index);
}

// Petits lexiques — utilisés pour résoudre un libellé FR à partir d'un
// slug anglais stocké en base (voir docs/DATA_MODEL.md § "charnière i18n").
function buildLabelMap(entries: { index: string; name: string }[]): Record<string, string> {
  return Object.fromEntries(entries.map((e) => [e.index, e.name]));
}

export const CONDITION_LABELS = buildLabelMap(conditionsData as { index: string; name: string }[]);
export const CLASS_LABELS = buildLabelMap(classesData as { index: string; name: string }[]);
export const RACE_LABELS = buildLabelMap(racesData as { index: string; name: string }[]);
export const BACKGROUND_LABELS = buildLabelMap(backgroundsData as { index: string; name: string }[]);
export const ALIGNMENT_LABELS = buildLabelMap(alignmentsData as { index: string; name: string }[]);
export const LANGUAGE_LABELS = buildLabelMap(languagesData as { index: string; name: string }[]);
export const SRD_SKILL_LABELS = buildLabelMap(skillsData as { index: string; name: string }[]);
