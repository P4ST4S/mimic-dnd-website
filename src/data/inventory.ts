import "server-only";
import { db } from "@/lib/db";
import { assertCanEditCharacter } from "@/lib/dal";
import type { ItemCategory } from "@/generated/prisma/enums";

async function characterOwnerId(characterId: string): Promise<string | null> {
  const character = await db.character.findUnique({
    where: { id: characterId },
    select: { ownerId: true },
  });
  return character?.ownerId ?? null;
}

export interface NewInventoryItemInput {
  name: string;
  category: ItemCategory;
  quantity: number;
  weightLb: number | null;
}

export async function addInventoryItem(characterId: string, input: NewInventoryItemInput) {
  const ownerId = await characterOwnerId(characterId);
  if (!ownerId) throw new Error("Personnage introuvable.");
  await assertCanEditCharacter(ownerId);

  const last = await db.inventoryItem.findFirst({
    where: { characterId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  return db.inventoryItem.create({
    data: {
      characterId,
      name: input.name,
      category: input.category,
      quantity: input.quantity,
      weightLb: input.weightLb,
      order: (last?.order ?? -1) + 1,
    },
  });
}

export async function toggleItemFlag(
  itemId: string,
  flag: "equipped" | "attuned",
  value: boolean,
) {
  const item = await db.inventoryItem.findUnique({
    where: { id: itemId },
    select: { characterId: true, character: { select: { ownerId: true } } },
  });
  if (!item) throw new Error("Objet introuvable.");
  await assertCanEditCharacter(item.character.ownerId);

  return db.inventoryItem.update({
    where: { id: itemId },
    data: { [flag]: value },
  });
}

export async function updateItemQuantity(itemId: string, quantity: number) {
  const item = await db.inventoryItem.findUnique({
    where: { id: itemId },
    select: { character: { select: { ownerId: true } } },
  });
  if (!item) throw new Error("Objet introuvable.");
  await assertCanEditCharacter(item.character.ownerId);

  return db.inventoryItem.update({
    where: { id: itemId },
    data: { quantity: Math.max(0, quantity) },
  });
}

export async function removeInventoryItem(itemId: string) {
  const item = await db.inventoryItem.findUnique({
    where: { id: itemId },
    select: { character: { select: { ownerId: true } } },
  });
  if (!item) throw new Error("Objet introuvable.");
  await assertCanEditCharacter(item.character.ownerId);

  return db.inventoryItem.delete({ where: { id: itemId } });
}
