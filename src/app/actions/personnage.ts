"use server";

import { revalidatePath } from "next/cache";
import {
  updateCharacterAbilities,
  updateCharacterCombat,
} from "@/data/characters";
import { AbilityScoresSchema, CombatStateSchema } from "@/lib/validation/character";

export interface FormActionState {
  error?: string;
  ok?: boolean;
}

function pathsFor(slug: string) {
  return ["/", `/personnages/${slug}`, "/mon-personnage", "/mj"] as const;
}

export async function saveAbilityScores(
  characterId: string,
  slug: string,
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = AbilityScoresSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Valeurs invalides (1 à 30)." };
  }

  try {
    await updateCharacterAbilities(characterId, parsed.data);
  } catch {
    return { error: "Impossible d'enregistrer les caractéristiques." };
  }

  for (const path of pathsFor(slug)) revalidatePath(path);
  return { ok: true };
}

export async function saveCombatState(
  characterId: string,
  slug: string,
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const raw = Object.fromEntries(formData);
  const parsed = CombatStateSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Valeurs de combat invalides." };
  }

  try {
    await updateCharacterCombat(characterId, {
      ...parsed.data,
      inspiration: formData.get("inspiration") === "on",
    });
  } catch {
    return { error: "Impossible d'enregistrer l'état de combat." };
  }

  for (const path of pathsFor(slug)) revalidatePath(path);
  return { ok: true };
}
