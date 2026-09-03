/**
 * Règle optionnelle d'encombrement (PHB p.176), exprimée en livres (lb),
 * l'unité du Manuel des Joueurs français — voir docs/DATA_MODEL.md.
 */
export type EncumbranceLevel = "none" | "encumbered" | "heavily-encumbered";

export function carryCapacity(strengthScore: number): number {
  return strengthScore * 15;
}

export function encumbranceLevel(
  totalWeightLb: number,
  strengthScore: number,
): EncumbranceLevel {
  if (totalWeightLb > strengthScore * 10) return "heavily-encumbered";
  if (totalWeightLb > strengthScore * 5) return "encumbered";
  return "none";
}

/** Malus de vitesse en pieds appliqué par le niveau d'encombrement. */
export function encumbranceSpeedPenalty(level: EncumbranceLevel): number {
  switch (level) {
    case "heavily-encumbered":
      return 20;
    case "encumbered":
      return 10;
    default:
      return 0;
  }
}

export const ENCUMBRANCE_LABELS_FR: Record<EncumbranceLevel, string> = {
  none: "Non encombré",
  encumbered: "Encombré",
  "heavily-encumbered": "Lourdement encombré",
};
