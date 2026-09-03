import { abilityModifier, formatModifier } from "@/lib/rules";

interface AbilityScoreProps {
  label: string;
  score: number;
}

export function AbilityScore({ label, score }: AbilityScoreProps) {
  const mod = abilityModifier(score);
  return (
    <div className="ability-score" role="group" aria-label={label}>
      <div className="ability-score__inner">
        <span className="ability-score__label">{label}</span>
        <span className="ability-score__value">{score}</span>
        <span className="ability-score__mod">{formatModifier(mod)}</span>
      </div>
    </div>
  );
}
