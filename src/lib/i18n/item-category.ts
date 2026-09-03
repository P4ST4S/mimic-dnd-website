import { ItemCategory } from "@/generated/prisma/enums";

export const ITEM_CATEGORY_LABELS_FR: Record<string, string> = {
  [ItemCategory.WEAPON]: "Arme",
  [ItemCategory.ARMOR]: "Armure",
  [ItemCategory.SHIELD]: "Bouclier",
  [ItemCategory.AMMUNITION]: "Munitions",
  [ItemCategory.POTION]: "Potion",
  [ItemCategory.SCROLL]: "Parchemin",
  [ItemCategory.WAND]: "Baguette",
  [ItemCategory.ROD]: "Verge",
  [ItemCategory.RING]: "Anneau",
  [ItemCategory.WONDROUS]: "Objet merveilleux",
  [ItemCategory.TOOL]: "Outil",
  [ItemCategory.GEAR]: "Équipement",
  [ItemCategory.TREASURE]: "Trésor",
  [ItemCategory.OTHER]: "Autre",
};
