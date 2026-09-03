import { describe, expect, it } from "vitest";
import {
  abilityModifier,
  formatModifier,
  passivePerception,
  proficiencyBonus,
  skillBonus,
} from "./abilities";

describe("abilityModifier", () => {
  it.each([
    [1, -5],
    [8, -1],
    [9, -1],
    [10, 0],
    [11, 0],
    [12, 1],
    [16, 3],
    [20, 5],
    [30, 10],
  ])("score %i -> modificateur %i", (score, expected) => {
    expect(abilityModifier(score)).toBe(expected);
  });
});

describe("proficiencyBonus", () => {
  it.each([
    [1, 2],
    [4, 2],
    [5, 3],
    [8, 3],
    [9, 4],
    [12, 4],
    [13, 5],
    [16, 5],
    [17, 6],
    [20, 6],
  ])("niveau total %i -> bonus +%i", (level, expected) => {
    expect(proficiencyBonus(level)).toBe(expected);
  });
});

describe("formatModifier", () => {
  it("préfixe les valeurs positives et nulles d'un +", () => {
    expect(formatModifier(3)).toBe("+3");
    expect(formatModifier(0)).toBe("+0");
  });
  it("laisse le signe - pour les valeurs négatives", () => {
    expect(formatModifier(-2)).toBe("-2");
  });
});

describe("skillBonus", () => {
  it("non maîtrisé = seulement le modificateur de caractéristique", () => {
    expect(skillBonus(14, 5, "none")).toBe(abilityModifier(14));
  });
  it("maîtrisé ajoute le bonus de maîtrise une fois", () => {
    expect(skillBonus(14, 5, "proficient")).toBe(abilityModifier(14) + proficiencyBonus(5));
  });
  it("expertise ajoute le bonus de maîtrise deux fois", () => {
    expect(skillBonus(14, 5, "expert")).toBe(abilityModifier(14) + 2 * proficiencyBonus(5));
  });
});

describe("passivePerception", () => {
  it("= 10 + bonus de la compétence Perception", () => {
    // Sagesse 14 (mod +2), niveau 5 (maîtrise +3), maîtrisé -> 10 + 2 + 3 = 15
    expect(passivePerception(14, 5, "proficient")).toBe(15);
  });
});
