"use client";

import { useActionState } from "react";
import { saveAbilityScores, type FormActionState } from "@/app/actions/personnage";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { ABILITY_KEYS, ABILITY_LABELS_FR } from "@/lib/rules";

const FIELD_NAME = {
  str: "strength",
  dex: "dexterity",
  con: "constitution",
  int: "intelligence",
  wis: "wisdom",
  cha: "charisma",
} as const;

interface AbilityScoresFormProps {
  characterId: string;
  slug: string;
  scores: Record<(typeof FIELD_NAME)[keyof typeof FIELD_NAME], number>;
}

const INITIAL_STATE: FormActionState = {};

export function AbilityScoresForm({ characterId, slug, scores }: AbilityScoresFormProps) {
  const action = saveAbilityScores.bind(null, characterId, slug);
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
      {ABILITY_KEYS.map((key) => (
        <Field
          key={key}
          id={FIELD_NAME[key]}
          name={FIELD_NAME[key]}
          type="number"
          min={1}
          max={30}
          label={ABILITY_LABELS_FR[key].short}
          defaultValue={scores[FIELD_NAME[key]]}
        />
      ))}
      <div className="col-span-full flex items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        {state.ok && <span className="text-xs text-success">Enregistré.</span>}
        {state.error && (
          <span className="text-xs text-danger" role="alert">
            {state.error}
          </span>
        )}
      </div>
    </form>
  );
}
