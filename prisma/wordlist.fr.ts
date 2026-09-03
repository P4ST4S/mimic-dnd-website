/**
 * Petite liste de mots français à consonance "fantasy", utilisée par le
 * seed pour générer des phrases de passe mémorables (voir prisma/seed.ts).
 * Volontairement courte et embarquée dans le repo — ce n'est pas une
 * wordlist Diceware cryptographique, juste un générateur de mots de passe
 * temporaires pour 6 comptes, affichés une seule fois puis changés.
 */
export const FANTASY_WORDS_FR = [
  "taverne",
  "dragon",
  "gobelin",
  "parchemin",
  "chandelle",
  "donjon",
  "grimoire",
  "braise",
  "forêt",
  "rune",
  "lame",
  "bouclier",
  "corbeau",
  "brume",
  "sentier",
  "château",
  "potion",
  "harpe",
  "clairière",
  "lanterne",
  "montagne",
  "rivière",
  "auberge",
  "sortilège",
  "griffon",
  "trésor",
  "pierre",
  "orage",
  "flamme",
  "ombre",
] as const;
