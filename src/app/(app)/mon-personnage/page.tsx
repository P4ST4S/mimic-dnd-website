import Link from "next/link";
import { listOwnCharacters, getCharacterForEdit } from "@/data/characters";
import { AbilityScoresForm } from "./_components/ability-scores-form";
import { CombatStateForm } from "./_components/combat-state-form";
import { Button } from "@/components/ui/button";
import { OrnateCard } from "@/components/ui/ornate-card";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata = { title: "Ma fiche" };

export default async function MyCharacterPage() {
  const owned = await listOwnCharacters();
  const first = owned[0];

  if (!first) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <p className="flavor-text">
          Aucun personnage ne vous est encore associé — demandez au MJ de
          vérifier le seed (voir docs/RUNBOOK.md).
        </p>
      </main>
    );
  }

  const character = await getCharacterForEdit(first.id);
  if (!character) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <p className="flavor-text">Personnage introuvable.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="heading-smallcaps mb-1">Édition rapide</p>
          <h1 className="font-display text-3xl">{character.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link href={`/personnages/${character.slug}`}>Voir la fiche</Link>
          </Button>
          <Button asChild variant="ornate" size="sm">
            <Link href="/mon-personnage/inventaire">Inventaire</Link>
          </Button>
        </div>
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
