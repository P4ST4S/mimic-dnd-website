import Link from "next/link";
import { listRosterCharacters } from "@/data/characters";
import { HpBar } from "@/components/dnd/hp-bar";
import { OrnateCard } from "@/components/ui/ornate-card";
import { PortraitFrame } from "@/components/ui/portrait-frame";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function RosterPage() {
  const characters = await listRosterCharacters();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <SectionHeading>Le groupe</SectionHeading>
      <h1 className="mb-6 font-display text-3xl">Nos personnages</h1>

      {characters.length === 0 ? (
        <p className="flavor-text">
          Personne n’a encore rejoint la table — le MJ doit d’abord lancer le
          seed (voir docs/RUNBOOK.md).
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((c) => (
            <Link key={c.id} href={`/personnages/${c.slug}`} className="group">
              <OrnateCard className="h-full transition-transform group-hover:-translate-y-0.5">
                <div className="flex gap-4">
                  <PortraitFrame src={c.portraitUrl} alt={c.name} className="w-20 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-display text-lg">{c.name}</h2>
                    <p className="text-xs text-text-muted">
                      {c.classes.map((cl) => `${cl.classLabel} ${cl.level}`).join(" / ") || "—"}
                    </p>
                    <p className="mb-2 text-xs text-text-subtle">
                      Joué par {c.owner.displayName}
                    </p>
                    <HpBar current={c.hpCurrent} max={c.hpMax} temp={c.hpTemp} />
                  </div>
                </div>
              </OrnateCard>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
