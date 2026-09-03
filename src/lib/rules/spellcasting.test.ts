import { describe, expect, it } from "vitest";
import {
  multiclassCasterLevel,
  pactMagicSlots,
  spellAttackBonus,
  spellSaveDC,
  spellSlotsForCasterLevel,
} from "./spellcasting";

describe("multiclassCasterLevel", () => {
  it("un plein lanceur seul compte son niveau en entier", () => {
    expect(multiclassCasterLevel([{ casterType: "full", level: 5 }])).toBe(5);
  });

  it("Guerrier 3 / Magicien 2 -> le Guerrier ne compte pas", () => {
    const level = multiclassCasterLevel([
      { casterType: "none", level: 3 },
      { casterType: "full", level: 2 },
    ]);
    expect(level).toBe(2);
  });

  it("Paladin 6 / Sorcier — le Sorcier (pact) est exclu du calcul composite", () => {
    // PHB p.164 : demi-lanceur niveau 6 -> floor(6/2) = 3 ; le pact magic
    // du Sorcier ne s'additionne JAMAIS à ce total.
    const level = multiclassCasterLevel([
      { casterType: "half", level: 6 },
      { casterType: "pact", level: 4 },
    ]);
    expect(level).toBe(3);
  });

  it("Guerrier (Chevalier occulte) 7 -> tiers-lanceur, floor(7/3) = 2", () => {
    expect(multiclassCasterLevel([{ casterType: "third", level: 7 }])).toBe(2);
  });
});

describe("spellSlotsForCasterLevel", () => {
  it("niveau de lanceur 1 -> deux emplacements de niveau 1", () => {
    expect(spellSlotsForCasterLevel(1)).toEqual([2, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
  it("niveau de lanceur 5 -> table PHB (4,3,2,0,0,0,0,0,0)", () => {
    expect(spellSlotsForCasterLevel(5)).toEqual([4, 3, 2, 0, 0, 0, 0, 0, 0]);
  });
  it("niveau de lanceur 0 -> aucun emplacement", () => {
    expect(spellSlotsForCasterLevel(0)).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
});

describe("pactMagicSlots", () => {
  it("Sorcier niveau 1 -> 1 emplacement de niveau 1", () => {
    expect(pactMagicSlots(1)).toEqual({ slots: 1, level: 1 });
  });
  it("Sorcier niveau 11 -> 3 emplacements de niveau 5", () => {
    expect(pactMagicSlots(11)).toEqual({ slots: 3, level: 5 });
  });
});

describe("spellSaveDC / spellAttackBonus", () => {
  it("DD = 8 + maîtrise + mod. caractéristique", () => {
    // INT 16 (mod +3), niveau total 5 (maîtrise +3) -> DD = 8+3+3 = 14
    expect(spellSaveDC(16, 5)).toBe(14);
  });
  it("bonus d'attaque = maîtrise + mod. caractéristique", () => {
    expect(spellAttackBonus(16, 5)).toBe(3 + 3);
  });
});
