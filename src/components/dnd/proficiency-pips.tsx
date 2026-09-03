export type ProficiencyLevel = "none" | "proficient" | "expert";

const LABELS: Record<ProficiencyLevel, string> = {
  none: "non maîtrisé",
  proficient: "maîtrisé",
  expert: "expertise",
};

interface ProficiencyPipsProps {
  level: ProficiencyLevel;
}

/**
 * Deux pastilles : la première s'allume à "proficient", la seconde
 * (dorée) s'ajoute à "expert". L'état réel est porté par un <span
 * className="sr-only">, jamais par la seule couleur (voir globals.css §5.5).
 */
export function ProficiencyPips({ level }: ProficiencyPipsProps) {
  return (
    <span className="inline-flex items-center gap-1" title={LABELS[level]}>
      <span className={`pip ${level !== "none" ? "pip-filled" : ""}`} aria-hidden="true" />
      <span className={`pip ${level === "expert" ? "pip-expert" : ""}`} aria-hidden="true" />
      <span className="sr-only">{LABELS[level]}</span>
    </span>
  );
}
