import { z } from "zod";

export const AbilityScoresSchema = z.object({
  strength: z.coerce.number().int().min(1).max(30),
  dexterity: z.coerce.number().int().min(1).max(30),
  constitution: z.coerce.number().int().min(1).max(30),
  intelligence: z.coerce.number().int().min(1).max(30),
  wisdom: z.coerce.number().int().min(1).max(30),
  charisma: z.coerce.number().int().min(1).max(30),
});

// `inspiration` est une case à cocher : elle n'apparaît dans le FormData que
// cochée ("on"), et zod.coerce.boolean() ferait de "false" un true (Boolean("false")
// est vrai) — elle est donc dérivée à la main dans l'action, pas via ce schéma.
export const CombatStateSchema = z.object({
  hpCurrent: z.coerce.number().int().min(0),
  hpMax: z.coerce.number().int().min(1),
  hpTemp: z.coerce.number().int().min(0),
  armorClass: z.coerce.number().int().min(0).max(40),
});
