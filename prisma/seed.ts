/**
 * Seed idempotent : crée la campagne, les comptes et les personnages de
 * départ à partir de prisma/seed.data.json (gitignoré — copiez et éditez
 * prisma/seed.data.example.json, voir docs/RUNBOOK.md).
 *
 * - `upsert` sur l'e-mail : relançable sans dupliquer ni casser les données.
 * - Un mot de passe déjà en base n'est JAMAIS écrasé, sauf `-- --reset-passwords`.
 * - Les mots de passe générés sont affichés UNE SEULE FOIS en console.
 *
 * Usage : pnpm db:seed  (ou pnpm exec prisma db seed -- --reset-passwords)
 */
import "dotenv/config";
import { randomInt } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { CLASS_DEFAULTS } from "./class-defaults.fr";
import { FANTASY_WORDS_FR } from "./wordlist.fr";

const RESET_PASSWORDS = process.argv.includes("--reset-passwords");

interface SeedFeature {
  name: string;
  description?: string;
  source?: "CLASS" | "SUBCLASS" | "RACE" | "BACKGROUND" | "FEAT" | "ITEM" | "OTHER";
}

interface SeedSpell {
  name: string;
  srdIndex?: string;
  level: number;
  isPrepared?: boolean;
}

interface SeedItem {
  name: string;
  category?:
    | "WEAPON"
    | "ARMOR"
    | "SHIELD"
    | "AMMUNITION"
    | "POTION"
    | "SCROLL"
    | "WAND"
    | "ROD"
    | "RING"
    | "WONDROUS"
    | "TOOL"
    | "GEAR"
    | "TREASURE"
    | "OTHER";
  weightLb?: number;
  quantity?: number;
  equipped?: boolean;
}

interface SeedPortrait {
  /** Nom de fichier dans public/portraits/ (déjà déposé là avant le seed). */
  file: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface SeedCharacter {
  slug: string;
  name: string;
  classIndex: string;
  subclassLabel?: string;
  level: number;
  raceIndex?: string;
  raceLabel?: string;
  subraceIndex?: string;
  subraceLabel?: string;
  backgroundIndex?: string;
  backgroundLabel?: string;
  alignmentIndex?: string;
  abilities?: Partial<{
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  }>;
  /** Override — sinon calculée depuis la DEX (formule d'armure de base). */
  armorClass?: number;
  /** Override — sinon 30 (par défaut du schéma). */
  speedFt?: number;
  /** Override — sinon calculée depuis SAG + maîtrise Perception. */
  passivePerception?: number;
  /** Remplace les compétences génériques de CLASS_DEFAULTS si fourni. */
  skills?: string[];
  toolProficiencies?: string[];
  languages?: string[];
  features?: SeedFeature[];
  spells?: SeedSpell[];
  /** Remplace le paquetage générique STARTER_GEAR si fourni. */
  items?: SeedItem[];
  personalityTraits?: string;
  portrait?: SeedPortrait;
}

interface SeedUser {
  email: string;
  displayName: string;
  role: "DM" | "PLAYER";
  password?: string;
  character?: SeedCharacter;
}

interface SeedData {
  campaign: { slug: string; name: string };
  users: SeedUser[];
}

const STARTER_GEAR = [
  { name: "Sac à dos", weightLb: 5 },
  { name: "Rations (5 jours)", weightLb: 10 },
  { name: "Gourde", weightLb: 5 },
  { name: "Corde en chanvre (15 m)", weightLb: 10 },
];

function generatePassphrase(): string {
  const words = Array.from({ length: 3 }, () => {
    const w = FANTASY_WORDS_FR[randomInt(FANTASY_WORDS_FR.length)];
    return w;
  });
  const digits = String(randomInt(10, 99));
  return `${words.join("-")}-${digits}`;
}

async function loadSeedData(): Promise<SeedData> {
  const dataPath = path.resolve(__dirname, "seed.data.json");
  const examplePath = path.resolve(__dirname, "seed.data.example.json");
  try {
    const raw = await readFile(dataPath, "utf-8");
    return JSON.parse(raw) as SeedData;
  } catch {
    console.warn(
      "⚠ prisma/seed.data.json introuvable — utilisation de seed.data.example.json.\n" +
        "  Copiez ce fichier et éditez-le avec les vraies adresses de la table :\n" +
        `  cp ${path.relative(process.cwd(), examplePath)} prisma/seed.data.json\n`,
    );
    const raw = await readFile(examplePath, "utf-8");
    return JSON.parse(raw) as SeedData;
  }
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL manquant — voir .env.example.");
  }
  const db = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

  const data = await loadSeedData();
  const generatedCredentials: { email: string; password: string }[] = [];

  async function upsertUser(seedUser: SeedUser) {
    const existing = await db.user.findUnique({ where: { email: seedUser.email } });

    let passwordHash: string;
    if (existing && !RESET_PASSWORDS) {
      passwordHash = existing.passwordHash;
    } else if (seedUser.password) {
      passwordHash = await bcrypt.hash(seedUser.password, 12);
    } else {
      const passphrase = generatePassphrase();
      passwordHash = await bcrypt.hash(passphrase, 12);
      generatedCredentials.push({ email: seedUser.email, password: passphrase });
    }

    const user = await db.user.upsert({
      where: { email: seedUser.email },
      create: {
        email: seedUser.email,
        displayName: seedUser.displayName,
        role: seedUser.role,
        passwordHash,
        mustChangePassword: !seedUser.password,
      },
      update: {
        displayName: seedUser.displayName,
        role: seedUser.role,
        passwordHash,
      },
    });
    console.log(`  ✔ ${user.role === "DM" ? "MJ" : "Joueur"} · ${user.displayName} <${user.email}>`);
    return user;
  }

  // Le MJ doit exister AVANT la campagne : `Campaign.dmId` est une colonne
  // obligatoire (une campagne sans MJ n'a pas de sens dans ce modèle).
  const dmSeedUser = data.users.find((u) => u.role === "DM");
  if (!dmSeedUser) {
    throw new Error("seed.data.json doit contenir au moins un utilisateur role=\"DM\".");
  }
  const dmUser = await upsertUser(dmSeedUser);

  console.log(`\nCampagne « ${data.campaign.name} »…`);
  const campaign = await db.campaign.upsert({
    where: { slug: data.campaign.slug },
    create: { slug: data.campaign.slug, name: data.campaign.name, dmId: dmUser.id },
    update: { name: data.campaign.name, dmId: dmUser.id },
  });

  for (const seedUser of data.users) {
    const user = seedUser === dmSeedUser ? dmUser : await upsertUser(seedUser);
    if (seedUser.character) {
      await seedCharacter(db, user.id, campaign.id, seedUser.character);
    }
  }

  if (generatedCredentials.length > 0) {
    console.log("\n┌─ Mots de passe générés — à transmettre en message privé ────────────┐");
    for (const { email, password } of generatedCredentials) {
      console.log(`│ ${email.padEnd(28)} ${password}`);
    }
    console.log("└───────────────────────────────────────────────────────────────────┘");
    console.log("⚠ Ces mots de passe ne seront plus jamais affichés.\n");
  } else {
    console.log("\nAucun nouveau mot de passe généré (comptes déjà initialisés).\n");
  }

  await db.$disconnect();
}

async function seedCharacter(
  db: PrismaClient,
  ownerId: string,
  campaignId: string,
  input: SeedCharacter,
) {
  const classDef = CLASS_DEFAULTS[input.classIndex];
  if (!classDef) {
    throw new Error(`Classe inconnue dans class-defaults.fr.ts : ${input.classIndex}`);
  }

  const abilities = {
    strength: input.abilities?.strength ?? 10,
    dexterity: input.abilities?.dexterity ?? 10,
    constitution: input.abilities?.constitution ?? 10,
    intelligence: input.abilities?.intelligence ?? 10,
    wisdom: input.abilities?.wisdom ?? 10,
    charisma: input.abilities?.charisma ?? 10,
  };
  const conMod = Math.floor((abilities.constitution - 10) / 2);
  // PV niveau 1 = max du dé de vie + mod CON ; niveaux suivants = moyenne + mod CON.
  const avgRoll = classDef.hitDie / 2 + 1;
  const hpMax = Math.max(
    1,
    classDef.hitDie + conMod + Math.round((input.level - 1) * (avgRoll + conMod)),
  );

  const skillIndexes = input.skills ?? classDef.skills;
  const gear: SeedItem[] =
    input.items ?? STARTER_GEAR.map((g) => ({ name: g.name, weightLb: g.weightLb }));
  const portrait = input.portrait;

  const character = await db.character.upsert({
    where: { slug: input.slug },
    create: {
      slug: input.slug,
      name: input.name,
      ownerId,
      campaignId,
      raceIndex: input.raceIndex,
      raceLabel: input.raceLabel,
      subraceIndex: input.subraceIndex,
      subraceLabel: input.subraceLabel,
      backgroundIndex: input.backgroundIndex,
      backgroundLabel: input.backgroundLabel,
      alignmentIndex: input.alignmentIndex,
      ...abilities,
      hpMax,
      hpCurrent: hpMax,
      armorClass: input.armorClass ?? 10 + Math.floor((abilities.dexterity - 10) / 2),
      speedFt: input.speedFt ?? 30,
      passivePerceptionOverride: input.passivePerception,
      savingThrowProficiencies: classDef.savingThrows,
      spellcastingAbility: classDef.spellcastingAbility,
      portraitUrl: portrait ? `/portraits/${portrait.file}` : undefined,
      portraitAlt: portrait?.alt,
      portraitWidth: portrait?.width,
      portraitHeight: portrait?.height,
      classes: {
        create: {
          classIndex: input.classIndex,
          classLabel: classDef.label,
          subclassLabel: input.subclassLabel,
          level: input.level,
          hitDieSize: classDef.hitDie,
          isPrimary: true,
        },
      },
      skills: {
        create: skillIndexes.map((skillIndex) => ({
          skillIndex,
          proficiency: "PROFICIENT" as const,
        })),
      },
      proficiencies: {
        create: [
          ...(input.toolProficiencies ?? []).map((label, i) => ({
            kind: "TOOL" as const,
            label,
            order: i,
          })),
          ...(input.languages ?? []).map((label, i) => ({
            kind: "LANGUAGE" as const,
            label,
            order: i,
          })),
        ],
      },
      features: {
        create: (input.features ?? []).map((f, i) => ({
          name: f.name,
          description: f.description,
          source: f.source ?? "CLASS",
          order: i,
        })),
      },
      spells: {
        create: (input.spells ?? []).map((s, i) => ({
          srdIndex: s.srdIndex,
          name: s.name,
          level: s.level,
          isPrepared: s.isPrepared ?? true,
          source: "CLASS" as const,
          order: i,
        })),
      },
      items: {
        create: gear.map((item, i) => ({
          name: item.name,
          category: item.category ?? "GEAR",
          weightLb: item.weightLb,
          quantity: item.quantity ?? 1,
          equipped: item.equipped ?? false,
          order: i,
        })),
      },
      bio: { create: { personalityTraits: input.personalityTraits } },
    },
    update: {
      name: input.name,
      campaignId,
      ...abilities,
    },
  });

  console.log(`    → Personnage « ${character.name} » (${classDef.label} ${input.level})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
