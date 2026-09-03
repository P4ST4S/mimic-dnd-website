import { z } from "zod";
import { ItemCategory } from "@/generated/prisma/enums";

export const NewInventoryItemSchema = z.object({
  name: z.string().trim().min(1, { error: "Le nom est requis." }).max(120),
  category: z.enum(ItemCategory),
  quantity: z.coerce.number().int().min(1).max(999),
  weightLb: z.coerce.number().min(0).max(9999).nullable().optional(),
});
