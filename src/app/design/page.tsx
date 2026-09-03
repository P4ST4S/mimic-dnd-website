import { notFound } from "next/navigation";
import { AbilityScore } from "@/components/dnd/ability-score";
import { HpBar } from "@/components/dnd/hp-bar";
import { ProficiencyPips } from "@/components/dnd/proficiency-pips";
import { StatBlock } from "@/components/dnd/stat-block";
import { InventoryTable, type InventoryItemView } from "@/components/dnd/inventory-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, TextAreaField } from "@/components/ui/field";
import { Fleuron } from "@/components/ui/fleuron";
import { OrnateCard } from "@/components/ui/ornate-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export const metadata = { title: "Design system" };

const SAMPLE_ITEMS: InventoryItemView[] = [
  { id: "1", name: "Épée longue", quantity: 1, weightLb: 3, equipped: true, attuned: false, rarity: "commun" },
  { id: "2", name: "Anneau de protection", quantity: 1, weightLb: 0, equipped: true, attuned: true, rarity: "rare" },
  { id: "3", name: "Potion de soins", quantity: 4, weightLb: 0.5, equipped: false, attuned: false, rarity: "commun" },
  { id: "4", name: "Bâton de l'archimage", quantity: 1, weightLb: 4, equipped: false, attuned: true, rarity: "légendaire" },
];

/**
 * Page kitchen-sink : référence vivante du design system, dans les deux
 * thèmes côte à côte (le test qui prouve que @theme inline fonctionne
 * réellement — voir globals.css §"COUCHE 3"). Désactivée en production.
 */
export default function DesignPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="mx-auto max-w-6xl space-y-12 px-6 py-12">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Design system — Mimic</h1>
        <ThemeToggle />
      </header>

      <p className="flavor-text">
        Cette page n&apos;existe qu&apos;en développement. Les deux panneaux
        ci-dessous forcent respectivement{" "}
        <code>data-theme=&quot;light&quot;</code> et{" "}
        <code>data-theme=&quot;dark&quot;</code> — s&apos;ils divergent
        correctement l&apos;un de l&apos;autre quel que soit le thème choisi
        ci-dessus via l&apos;interrupteur, c&apos;est que{" "}
        <code>@theme inline</code> fonctionne.
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        <div data-theme="light" className="surface-parchment rounded-card border border-border p-6">
          <Sample />
        </div>
        <div data-theme="dark" className="surface-parchment rounded-card border border-border p-6">
          <Sample />
        </div>
      </div>
    </main>
  );
}

function Sample() {
  return (
    <div className="space-y-8 text-text">
      <section>
        <SectionHeading>Typographie</SectionHeading>
        <h2 className="font-display text-2xl">Titre de section</h2>
        <p className="dropcap mt-2">
          Léandre d&apos;Escalonde referma le grimoire poussiéreux, les doigts
          tremblants. Ce que la lumière des chandelles venait de révéler ne
          pouvait plus être ignoré : la légende du mimique aux mille visages
          était vraie.
        </p>
      </section>

      <Fleuron />

      <section>
        <SectionHeading>Caractéristiques</SectionHeading>
        <div className="mt-3 flex flex-wrap gap-3">
          <AbilityScore label="FOR" score={16} />
          <AbilityScore label="DEX" score={14} />
          <AbilityScore label="CON" score={13} />
          <AbilityScore label="INT" score={8} />
          <AbilityScore label="SAG" score={12} />
          <AbilityScore label="CHA" score={10} />
        </div>
      </section>

      <section>
        <SectionHeading>Points de vie & maîtrises</SectionHeading>
        <div className="mt-3 space-y-3">
          <HpBar current={18} max={44} temp={5} />
          <div className="flex items-center gap-4 text-sm">
            <span>Discrétion</span>
            <ProficiencyPips level="expert" />
            <span>Athlétisme</span>
            <ProficiencyPips level="proficient" />
            <span>Arcanes</span>
            <ProficiencyPips level="none" />
          </div>
        </div>
      </section>

      <section>
        <SectionHeading>Badges & boutons</SectionHeading>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone="neutral">Commun</Badge>
          <Badge tone="accent">Équipé</Badge>
          <Badge tone="ornament">Légendaire</Badge>
          <Badge tone="success">Réussite</Badge>
          <Badge tone="danger">Échec</Badge>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="primary" size="sm">Attaquer</Button>
          <Button variant="secondary" size="sm">Défendre</Button>
          <Button variant="ornate" size="sm">Lancer un sort</Button>
          <Button variant="ghost" size="sm">Annuler</Button>
        </div>
      </section>

      <section>
        <SectionHeading>Champs de formulaire</SectionHeading>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Field id="name" label="Nom du personnage" placeholder="Sylvaine" />
          <Field id="level" label="Niveau" type="number" defaultValue={5} />
        </div>
        <div className="mt-3">
          <TextAreaField id="bio" label="Historique" placeholder="Née dans les forêts de..." />
        </div>
      </section>

      <section>
        <SectionHeading>Carte ornementale</SectionHeading>
        <OrnateCard className="mt-3">
          <p>Un panneau à coins gravés, la brique de base des fiches.</p>
        </OrnateCard>
      </section>

      <section>
        <SectionHeading>Inventaire</SectionHeading>
        <div className="mt-3">
          <InventoryTable items={SAMPLE_ITEMS} />
        </div>
      </section>

      <section>
        <SectionHeading>Stat block</SectionHeading>
        <div className="mt-3">
          <StatBlock
            name="Gobelours"
            meta="Humanoïde (gobelinoïde) de taille M, chaotique mauvais"
            scores={{ str: 17, dex: 12, con: 15, int: 7, wis: 9, cha: 11 }}
          >
            <p className="statblock__trait">
              <em>Fureur au bord de la mort.</em> Quand le gobelours tombe à 0
              point de vie, il peut faire une attaque avant de tomber.
            </p>
          </StatBlock>
        </div>
      </section>
    </div>
  );
}
