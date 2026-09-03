"use client";

import { useActionState } from "react";
import { addItem } from "@/app/actions/inventaire";
import type { FormActionState } from "@/app/actions/personnage";
import { Button } from "@/components/ui/button";
import { Field, SelectField } from "@/components/ui/field";
import { ITEM_CATEGORY_LABELS_FR } from "@/lib/i18n/item-category";

const INITIAL_STATE: FormActionState = {};

interface AddItemFormProps {
  characterId: string;
  slug: string;
  /** Noms d'équipement du SRD FR, pour l'autocomplétion native (<datalist>). */
  srdSuggestions: string[];
}

export function AddItemForm({ characterId, slug, srdSuggestions }: AddItemFormProps) {
  const action = addItem.bind(null, characterId, slug);
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      <Field
        id="name"
        name="name"
        label="Objet"
        placeholder="Épée longue"
        className="col-span-2"
        list="srd-equipment-suggestions"
        autoComplete="off"
      />
      <datalist id="srd-equipment-suggestions">
        {srdSuggestions.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <SelectField id="category" name="category" label="Catégorie" defaultValue="GEAR">
        {Object.entries(ITEM_CATEGORY_LABELS_FR).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </SelectField>
      <Field id="quantity" name="quantity" type="number" min={1} label="Qté" defaultValue={1} />
      <Field id="weightLb" name="weightLb" type="number" min={0} step="0.1" label="Poids (lb)" />

      <div className="col-span-full flex items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Ajout…" : "Ajouter à l'inventaire"}
        </Button>
        {state.error && (
          <span className="text-xs text-danger" role="alert">
            {state.error}
          </span>
        )}
      </div>
    </form>
  );
}
