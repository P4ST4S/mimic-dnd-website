import type { ReactNode } from "react";
import { AbilityScore } from "./ability-score";
import { ABILITY_KEYS, ABILITY_LABELS_FR } from "@/lib/rules";

interface StatBlockProps {
  name: string;
  meta: string;
  scores: Record<(typeof ABILITY_KEYS)[number], number>;
  children?: ReactNode;
}

/** Le stat block 5e signature : nom, méta, écussons de caractéristiques, corps libre. */
export function StatBlock({ name, meta, scores, children }: StatBlockProps) {
  return (
    <div className="statblock">
      <h3 className="statblock__name">{name}</h3>
      <p className="statblock__meta">{meta}</p>
      <hr className="rule-taper" />
      <div className="statblock__abilities">
        {ABILITY_KEYS.map((key) => (
          <AbilityScore key={key} label={ABILITY_LABELS_FR[key].short} score={scores[key]} />
        ))}
      </div>
      {children && (
        <>
          <hr className="rule-taper rule-taper-reverse" />
          <div className="statblock__section">{children}</div>
        </>
      )}
    </div>
  );
}
