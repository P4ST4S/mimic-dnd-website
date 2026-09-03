import { describe, expect, it } from "vitest";
import { carryCapacity, encumbranceLevel, encumbranceSpeedPenalty } from "./encumbrance";

describe("carryCapacity", () => {
  it("= Force × 15 livres", () => {
    expect(carryCapacity(14)).toBe(210);
  });
});

describe("encumbranceLevel", () => {
  it("sous 5×FOR : non encombré", () => {
    expect(encumbranceLevel(50, 14)).toBe("none"); // seuil à 70
  });
  it("entre 5×FOR et 10×FOR : encombré", () => {
    expect(encumbranceLevel(100, 14)).toBe("encumbered"); // 70 < 100 <= 140
  });
  it("au-dessus de 10×FOR : lourdement encombré", () => {
    expect(encumbranceLevel(150, 14)).toBe("heavily-encumbered");
  });
});

describe("encumbranceSpeedPenalty", () => {
  it("aucun malus si non encombré", () => {
    expect(encumbranceSpeedPenalty("none")).toBe(0);
  });
  it("-10 pieds si encombré, -20 si lourdement encombré", () => {
    expect(encumbranceSpeedPenalty("encumbered")).toBe(10);
    expect(encumbranceSpeedPenalty("heavily-encumbered")).toBe(20);
  });
});
