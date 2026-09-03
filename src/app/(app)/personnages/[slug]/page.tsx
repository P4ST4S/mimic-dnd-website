import Link from "next/link";
import { notFound } from "next/navigation";
import { getCharacterBySlug } from "@/data/characters";
import { AbilityScore } from "@/components/dnd/ability-score";
import { HpBar } from "@/components/dnd/hp-bar";
import { ProficiencyPips } from "@/components/dnd/proficiency-pips";
import { InventoryTable, type InventoryItemView } from "@/components/dnd/inventory-table";
import { Button } from "@/components/ui/button";
import { Fleuron } from "@/components/ui/fleuron";
import { PortraitFrame } from "@/components/ui/portrait-frame";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  ABILITY_KEYS,
  ABILITY_LABELS_FR,
  SKILLS,
  formatModifier,
  initiativeBonus,
  passivePerception,
  proficiencyBonus,
  spellAttackBonus,
  spellSaveDC,
} from "@/lib/rules";

export async function generateMetadata(props: PageProps<"/personnages/[slug]">) {
  const { slug } = await props.params;
  const character = await getCharacterBySlug(slug);
  return { title: character?.name ?? "Personnage introuvable" };
}

const ABILITY_SCORE_FIELD = {
  str: "strength",
  dex: "dexterity",
  con: "constitution",
  int: "intelligence",
  wis: "wisdom",
  cha: "charisma",
} as const;

export default async function CharacterSheetPage(props: PageProps<"/personnages/[slug]">) {
  const { slug } = await props.params;
  const character = await getCharacterBySlug(slug);
  if (!character) notFound();

  const totalLevel = character.classes.reduce((sum, c) => sum + c.level, 0) || 1;
  const profBonus = character.proficiencyBonusOverride ?? proficiencyBonus(totalLevel);
  const wisScore = character.wisdom;
  const perceptionSkill = character.skills.find((s) => s.skillIndex === "perception");
  const passivePerc =
    character.passivePerceptionOverride ??
    passivePerception(
      wisScore,
      totalLevel,
      perceptionSkill
        ? perceptionSkill.proficiency === "EXPERTISE"
          ? "expert"
          : perceptionSkill.proficiency === "PROFICIENT"
            ? "proficient"
            : "none"
        : "none",
    );

  const inventoryItems: InventoryItemView[] = character.items.map((item) => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    weightLb: item.weightLb ? Number(item.weightLb) : 0,
    equipped: item.equipped,
    attuned: item.attuned,
    rarity: item.rarity === "NONE" ? null : RARITY_LABELS[item.rarity],
  }));

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-start gap-6">
        <PortraitFrame
          src={character.portraitUrl}
          alt={character.name}
          priority
          className="w-40 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="heading-smallcaps mb-1">
            {character.raceLabel ?? "Race inconnue"} · Joué par {character.owner.displayName}
          </p>
          <h1 className="font-display text-4xl">{character.name}</h1>
          <p className="mt-1 text-text-muted">
            {character.classes.map((c) => `${c.classLabel} ${c.level}`).join(" / ") || "Sans classe"}
          </p>
          <div className="mt-4 max-w-md">
            <HpBar current={character.hpCurrent} max={character.hpMax} temp={character.hpTemp} />
          </div>
          {character.canEdit && (
            <Button asChild variant="secondary" size="sm" className="mt-4">
              <Link href="/mon-personnage">Éditer</Link>
            </Button>
          )}
        </div>
      </div>

      <Fleuron />

      <section className="mb-10">
        <SectionHeading>Caractéristiques</SectionHeading>
        <div className="mt-3 flex flex-wrap gap-3">
          {ABILITY_KEYS.map((key) => (
            <AbilityScore
              key={key}
              label={ABILITY_LABELS_FR[key].short}
              score={character[ABILITY_SCORE_FIELD[key]]}
            />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <Stat label="Classe d'armure" value={character.armorClass} />
          <Stat label="Bonus de maîtrise" value={formatModifier(profBonus)} />
          <Stat label="Initiative" value={formatModifier(initiativeBonus(character.dexterity) + character.initiativeMisc)} />
          <Stat label="Vitesse" value={`${character.speedFt} pi`} />
          <Stat label="Perception passive" value={passivePerc} />
        </div>
      </section>

      <section className="mb-10">
        <SectionHeading>Compétences</SectionHeading>
        <ul className="mt-3 grid grid-cols-1 gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
          {SKILLS.map((skill) => {
            const owned = character.skills.find((s) => s.skillIndex === skill.index);
            const level =
              owned?.proficiency === "EXPERTISE"
                ? "expert"
                : owned?.proficiency === "PROFICIENT" || owned?.proficiency === "HALF"
                  ? "proficient"
                  : "none";
            return (
              <li key={skill.index} className="flex items-center justify-between gap-2 py-0.5">
                <span className="flex items-center gap-2">
                  <ProficiencyPips level={level} />
                  {skill.label}
                  <span className="text-2xs text-text-subtle">
                    ({ABILITY_LABELS_FR[skill.ability].short})
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {character.spellcastingAbility && (
        <section className="mb-10">
          <SectionHeading>Incantation</SectionHeading>
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <Stat
              label="DD de sauvegarde"
              value={
                character.spellSaveDcOverride ??
                spellSaveDC(spellcastingScore(character, character.spellcastingAbility), totalLevel)
              }
            />
            <Stat
              label="Bonus d'attaque"
              value={formatModifier(
                character.spellAttackOverride ??
                  spellAttackBonus(spellcastingScore(character, character.spellcastingAbility), totalLevel),
              )}
            />
          </div>
          {character.spells.length > 0 && (
            <ul className="mt-4 space-y-1 text-sm">
              {character.spells.map((spell) => (
                <li key={spell.id} className="flex items-center gap-2">
                  <span className="font-mono text-2xs text-text-subtle">
                    {spell.level === 0 ? "Tour" : `Niv. ${spell.level}`}
                  </span>
                  {spell.name}
                  {spell.isPrepared && <span className="text-2xs text-accent">(préparé)</span>}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {character.features.length > 0 && (
        <section className="mb-10">
          <SectionHeading>Capacités & traits</SectionHeading>
          <ul className="mt-3 space-y-3">
            {character.features.map((f) => (
              <li key={f.id}>
                <p className="font-medium">{f.name}</p>
                {f.description && <p className="text-sm text-text-muted">{f.description}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-10">
        <SectionHeading>Inventaire</SectionHeading>
        <div className="mt-3">
          <InventoryTable items={inventoryItems} />
        </div>
      </section>

      {character.bio?.backstory && (
        <section className="mb-10">
          <SectionHeading>Historique</SectionHeading>
          <p className="dropcap mt-3 max-w-3xl">{character.bio.backstory}</p>
        </section>
      )}

      {character.notes.length > 0 && (
        <section>
          <SectionHeading>Notes</SectionHeading>
          <ul className="mt-3 space-y-3">
            {character.notes.map((note) => (
              <li key={note.id} className="flavor-text">
                {note.title && <p className="not-italic font-medium">{note.title}</p>}
                <p>{note.body}</p>
                <p className="mt-1 text-2xs text-text-subtle">— {note.author.displayName}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="heading-smallcaps">{label}</p>
      <p className="font-display text-xl">{value}</p>
    </div>
  );
}

function spellcastingScore(
  character: { strength: number; dexterity: number; constitution: number; intelligence: number; wisdom: number; charisma: number },
  ability: string,
): number {
  switch (ability) {
    case "str":
      return character.strength;
    case "dex":
      return character.dexterity;
    case "con":
      return character.constitution;
    case "int":
      return character.intelligence;
    case "wis":
      return character.wisdom;
    case "cha":
      return character.charisma;
    default:
      return 10;
  }
}

const RARITY_LABELS: Record<string, string> = {
  COMMON: "commun",
  UNCOMMON: "peu commun",
  RARE: "rare",
  VERY_RARE: "très rare",
  LEGENDARY: "légendaire",
  ARTIFACT: "artéfact",
  VARIES: "variable",
};
