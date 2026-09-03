import { abilityModifier } from "./abilities";

/** Initiative = modificateur de Dextérité (+ bonus éventuels, non gérés en v1). */
export function initiativeBonus(dexScore: number): number {
  return abilityModifier(dexScore);
}

/**
 * Dés de vie : un pool par classe (multiclassage). Ex. Guerrier 3 / Magicien 2
 * -> [{ die: 10, count: 3 }, { die: 6, count: 2 }].
 */
export interface HitDicePool {
  die: 6 | 8 | 10 | 12;
  count: number;
}

export function totalHitDice(pools: readonly HitDicePool[]): number {
  return pools.reduce((sum, p) => sum + p.count, 0);
}

export function formatHitDice(pools: readonly HitDicePool[]): string {
  return pools
    .filter((p) => p.count > 0)
    .map((p) => `${p.count}d${p.die}`)
    .join(" + ");
}

/** Ratio [0,1] pour l'affichage de la barre de PV. */
export function hpRatio(current: number, max: number): number {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(1, current / max));
}

export type HpState = "healthy" | "hurt" | "crit";

/** État visuel de la barre de PV : ensanglanté sous la moitié, critique sous le quart. */
export function hpState(current: number, max: number): HpState {
  const ratio = hpRatio(current, max);
  if (ratio <= 0.25) return "crit";
  if (ratio <= 0.5) return "hurt";
  return "healthy";
}
