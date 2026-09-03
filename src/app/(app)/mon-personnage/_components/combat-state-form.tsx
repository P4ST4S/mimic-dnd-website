"use client";

import { useActionState } from "react";
import { saveCombatState, type FormActionState } from "@/app/actions/personnage";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

interface CombatStateFormProps {
  characterId: string;
  slug: string;
  hpCurrent: number;
  hpMax: number;
  hpTemp: number;
  armorClass: number;
  inspiration: boolean;
}

const INITIAL_STATE: FormActionState = {};

export function CombatStateForm({
  characterId,
  slug,
  hpCurrent,
  hpMax,
  hpTemp,
  armorClass,
  inspiration,
}: CombatStateFormProps) {
  const action = saveCombatState.bind(null, characterId, slug);
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Field id="hpCurrent" name="hpCurrent" type="number" min={0} label="PV actuels" defaultValue={hpCurrent} />
      <Field id="hpMax" name="hpMax" type="number" min={1} label="PV maximum" defaultValue={hpMax} />
      <Field id="hpTemp" name="hpTemp" type="number" min={0} label="PV temporaires" defaultValue={hpTemp} />
      <Field id="armorClass" name="armorClass" type="number" min={0} max={40} label="Classe d'armure" defaultValue={armorClass} />

      <label className="col-span-full flex items-center gap-2 text-sm">
        <input type="checkbox" name="inspiration" defaultChecked={inspiration} className="h-4 w-4" />
        Inspiration héroïque
      </label>

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
