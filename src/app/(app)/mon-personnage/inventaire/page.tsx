import Link from "next/link";
import { listOwnCharacters, getCharacterForEdit } from "@/data/characters";
import { AddItemForm } from "./_components/add-item-form";
import { InventoryEditor } from "./_components/inventory-editor";
import { Button } from "@/components/ui/button";
import { OrnateCard } from "@/components/ui/ornate-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { carryCapacity, encumbranceLevel, ENCUMBRANCE_LABELS_FR } from "@/lib/rules";
import { listAllEquipmentNames } from "@/srd";

export const metadata = { title: "Inventaire" };

export default async function InventoryPage() {
  const owned = await listOwnCharacters();
  const first = owned[0];
  if (!first) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <p className="flavor-text">Aucun personnage ne vous est encore associé.</p>
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

  const totalWeight = character.items.reduce(
    (sum, item) => sum + (item.weightLb ? Number(item.weightLb) : 0) * item.quantity,
    0,
  );
  const capacity = carryCapacity(character.strength);
  const level = encumbranceLevel(totalWeight, character.strength);

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="heading-smallcaps mb-1">Inventaire</p>
          <h1 className="font-display text-3xl">{character.name}</h1>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href="/mon-personnage">Retour à la fiche</Link>
        </Button>
      </div>

      <OrnateCard>
        <SectionHeading>Encombrement</SectionHeading>
        <p className="mt-3 text-sm">
          <strong className="font-mono">{totalWeight.toFixed(1)} lb</strong> portées sur{" "}
          <strong className="font-mono">{capacity} lb</strong> de capacité —{" "}
          <span className={level !== "none" ? "text-danger" : "text-success"}>
            {ENCUMBRANCE_LABELS_FR[level]}
          </span>
        </p>
      </OrnateCard>

      <OrnateCard>
        <SectionHeading>Ajouter un objet</SectionHeading>
        <div className="mt-3">
          <AddItemForm
            characterId={character.id}
            slug={character.slug}
            srdSuggestions={[...listAllEquipmentNames()].sort()}
          />
        </div>
      </OrnateCard>

      <section>
        <SectionHeading>Objets</SectionHeading>
        <div className="mt-3">
          <InventoryEditor
            slug={character.slug}
            items={character.items.map((item) => ({
              id: item.id,
              name: item.name,
              category: item.category,
              quantity: item.quantity,
              weightLb: item.weightLb ? Number(item.weightLb) : 0,
              equipped: item.equipped,
              attuned: item.attuned,
              requiresAttunement: item.requiresAttunement,
            }))}
          />
        </div>
      </section>
    </main>
  );
}
