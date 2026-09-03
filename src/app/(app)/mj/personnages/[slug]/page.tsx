import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireDm } from "@/lib/dal";
import { getCharacterForEdit } from "@/data/characters";
import { AbilityScoresForm } from "@/app/(app)/mon-personnage/_components/ability-scores-form";
import { CombatStateForm } from "@/app/(app)/mon-personnage/_components/combat-state-form";
import { Button } from "@/components/ui/button";
import { OrnateCard } from "@/components/ui/ornate-card";
import { SectionHeading } from "@/components/ui/section-heading";

export async function generateMetadata(props: PageProps<"/mj/personnages/[slug]">) {
  const { slug } = await props.params;
  const character = await db.character.findUnique({ where: { slug }, select: { name: true } });
  return { title: character ? `MJ · ${character.name}` : "Personnage introuvable" };
}

export default async function DmEditCharacterPage(props: PageProps<"/mj/personnages/[slug]">) {
  await requireDm();
  const { slug } = await props.params;

  const found = await db.character.findUnique({ where: { slug }, select: { id: true } });
  if (!found) notFound();

  const character = await getCharacterForEdit(found.id);
  if (!character) notFound();

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="heading-smallcaps mb-1">Édition MJ</p>
          <h1 className="font-display text-3xl">{character.name}</h1>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href={`/personnages/${character.slug}`}>Voir la fiche</Link>
        </Button>
      </div>

      <OrnateCard>
        <SectionHeading>Caractéristiques</SectionHeading>
        <div className="mt-3">
          <AbilityScoresForm
            characterId={character.id}
            slug={character.slug}
            scores={{
              strength: character.strength,
              dexterity: character.dexterity,
              constitution: character.constitution,
              intelligence: character.intelligence,
              wisdom: character.wisdom,
              charisma: character.charisma,
            }}
          />
        </div>
      </OrnateCard>

      <OrnateCard>
        <SectionHeading>Combat</SectionHeading>
        <div className="mt-3">
          <CombatStateForm
            characterId={character.id}
            slug={character.slug}
            hpCurrent={character.hpCurrent}
            hpMax={character.hpMax}
            hpTemp={character.hpTemp}
            armorClass={character.armorClass}
            inspiration={character.inspiration}
          />
        </div>
      </OrnateCard>
    </main>
  );
}
