import Link from "next/link";
import { listAllCharactersForDm } from "@/data/characters";
import { HpBar } from "@/components/dnd/hp-bar";
import { OrnateCard } from "@/components/ui/ornate-card";
import { PortraitFrame } from "@/components/ui/portrait-frame";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata = { title: "Panneau MJ" };

export default async function DmPanelPage() {
  const characters = await listAllCharactersForDm();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <SectionHeading>Panneau MJ</SectionHeading>
      <h1 className="mb-6 font-display text-3xl">Tout le groupe</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {characters.map((c) => (
          <Link key={c.id} href={`/mj/personnages/${c.slug}`} className="group">
            <OrnateCard className="h-full transition-transform group-hover:-translate-y-0.5">
              <div className="flex gap-4">
                <PortraitFrame src={c.portraitUrl} alt={c.name} className="w-16 shrink-0" />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-display text-lg">{c.name}</h2>
                  <p className="text-xs text-text-muted">
                    {c.classes.map((cl) => `${cl.classLabel} ${cl.level}`).join(" / ") || "—"}
                  </p>
                  <p className="mb-2 text-xs text-text-subtle">{c.owner.displayName}</p>
                  <HpBar current={c.hpCurrent} max={c.hpMax} />
                </div>
              </div>
            </OrnateCard>
          </Link>
        ))}
      </div>
    </main>
  );
}
