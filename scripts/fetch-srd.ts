/**
 * Vendorise le SRD 5.1 en français dans src/srd/fr/*.json — voir
 * docs/adr/0004-srd-fr-vendorise.md pour le pourquoi (pas de fetch au
 * runtime : latence, dépendance à un service tiers, builds non
 * déterministes, et surtout on veut pouvoir corriger une traduction à la
 * main sans attendre l'amont).
 *
 * Source : les dumps JSON bruts fr-FR de 5e-bits/5e-database (SRD 5.1
 * officiel de Wizards of the Coast, licence CC-BY-4.0 — voir README.md
 * pour l'attribution complète, obligatoire).
 *
 * Usage : pnpm srd:sync
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL =
  "https://raw.githubusercontent.com/5e-bits/5e-database/main/src/2014/fr-FR";
const OUT_DIR = path.resolve(__dirname, "../src/srd/fr");

interface RefLike {
  index: string;
  name: string;
}

function ref(r: RefLike | null | undefined) {
  return r ? { index: r.index, name: r.name } : null;
}

async function fetchJson<T>(file: string): Promise<T> {
  const res = await fetch(`${BASE_URL}/${file}`);
  if (!res.ok) {
    throw new Error(`Échec du téléchargement de ${file} : HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function writeJson(name: string, data: unknown) {
  await mkdir(OUT_DIR, { recursive: true });
  const file = path.join(OUT_DIR, `${name}.json`);
  await writeFile(file, JSON.stringify(data, null, 2) + "\n", "utf-8");
  const sizeKb = (JSON.stringify(data).length / 1024).toFixed(1);
  console.log(`  ✔ ${name}.json (${sizeKb} Ko)`);
}

// ─────────────────────────── Élagage par catégorie ───────────────────────────
// On ne garde que les champs consommés par l'app (fiche, inventaire,
// autocomplétion) — jamais `url`, `updated_at` ni les métadonnées internes.

async function syncSpells() {
  interface RawSpell {
    index: string;
    name: string;
    level: number;
    school: RefLike;
    casting_time: string;
    range: string;
    components: string[];
    material?: string;
    duration: string;
    concentration: boolean;
    ritual: boolean;
    desc: string[];
    higher_level?: string[];
    classes: RefLike[];
  }
  const data = await fetchJson<RawSpell[]>("5e-SRD-Spells.json");
  const trimmed = data.map((s) => ({
    index: s.index,
    name: s.name,
    level: s.level,
    school: ref(s.school),
    castingTime: s.casting_time,
    range: s.range,
    components: s.components,
    material: s.material ?? null,
    duration: s.duration,
    concentration: s.concentration,
    ritual: s.ritual,
    desc: s.desc,
    higherLevel: s.higher_level ?? [],
    classes: s.classes?.map(ref) ?? [],
  }));
  await writeJson("spells", trimmed);
}

async function syncEquipment() {
  interface RawEquipment {
    index: string;
    name: string;
    equipment_category: RefLike;
    cost?: { quantity: number; unit: string };
    weight?: number;
    damage?: { damage_dice: string; damage_type: RefLike };
    armor_class?: { base: number; dex_bonus: boolean; max_bonus?: number };
    properties?: RefLike[];
    desc?: string[];
  }
  const data = await fetchJson<RawEquipment[]>("5e-SRD-Equipment.json");
  const trimmed = data.map((e) => ({
    index: e.index,
    name: e.name,
    category: ref(e.equipment_category),
    cost: e.cost ?? null,
    weightLb: e.weight ?? null,
    damage: e.damage
      ? { dice: e.damage.damage_dice, type: ref(e.damage.damage_type) }
      : null,
    armorClass: e.armor_class ?? null,
    properties: e.properties?.map(ref) ?? [],
    desc: e.desc ?? [],
  }));
  await writeJson("equipment", trimmed);
}

async function syncSimple(file: string, outName: string) {
  interface RawSimple {
    index: string;
    name: string;
    desc?: string[] | string;
    [key: string]: unknown;
  }
  const data = await fetchJson<RawSimple[]>(file);
  const trimmed = data.map((entry) => {
    const { index, name, desc, ...rest } = entry;
    delete rest.url; // chemin d'API interne, sans intérêt une fois vendorisé
    return { index, name, desc: desc ?? null, ...rest };
  });
  await writeJson(outName, trimmed);
}

async function main() {
  console.log("Synchronisation du SRD 5.1 FR depuis 5e-bits/5e-database…\n");
  await syncSpells();
  await syncEquipment();
  await syncSimple("5e-SRD-Skills.json", "skills");
  await syncSimple("5e-SRD-Conditions.json", "conditions");
  await syncSimple("5e-SRD-Classes.json", "classes");
  await syncSimple("5e-SRD-Races.json", "races");
  await syncSimple("5e-SRD-Backgrounds.json", "backgrounds");
  await syncSimple("5e-SRD-Alignments.json", "alignments");
  await syncSimple("5e-SRD-Languages.json", "languages");
  console.log("\nTerminé. Pensez à committer src/srd/fr/*.json.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
