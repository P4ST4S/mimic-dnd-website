"use server";

import { revalidatePath } from "next/cache";
import {
  addInventoryItem,
  removeInventoryItem,
  toggleItemFlag,
  updateItemQuantity,
} from "@/data/inventory";
import { NewInventoryItemSchema } from "@/lib/validation/inventory";
import type { FormActionState } from "./personnage";

export async function addItem(
  characterId: string,
  slug: string,
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = NewInventoryItemSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    quantity: formData.get("quantity") || 1,
    weightLb: formData.get("weightLb") || null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Objet invalide." };
  }

  try {
    await addInventoryItem(characterId, {
      name: parsed.data.name,
      category: parsed.data.category,
      quantity: parsed.data.quantity,
      weightLb: parsed.data.weightLb ?? null,
    });
  } catch {
    return { error: "Impossible d'ajouter l'objet." };
  }

  revalidatePath(`/personnages/${slug}`);
  revalidatePath("/mon-personnage/inventaire");
  return { ok: true };
}

export async function toggleEquipped(itemId: string, slug: string, equipped: boolean) {
  await toggleItemFlag(itemId, "equipped", equipped);
  revalidatePath(`/personnages/${slug}`);
  revalidatePath("/mon-personnage/inventaire");
}

export async function toggleAttuned(itemId: string, slug: string, attuned: boolean) {
  await toggleItemFlag(itemId, "attuned", attuned);
  revalidatePath(`/personnages/${slug}`);
  revalidatePath("/mon-personnage/inventaire");
}

export async function changeQuantity(itemId: string, slug: string, quantity: number) {
  await updateItemQuantity(itemId, quantity);
  revalidatePath(`/personnages/${slug}`);
  revalidatePath("/mon-personnage/inventaire");
}

export async function deleteItem(itemId: string, slug: string) {
  await removeInventoryItem(itemId);
  revalidatePath(`/personnages/${slug}`);
  revalidatePath("/mon-personnage/inventaire");
}
