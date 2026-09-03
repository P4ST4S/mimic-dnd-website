# ADR 0005 — Tables normalisées pour l'inventaire et les sorts, pas de Json

## Statut
Acceptée.

## Contexte
Les fiches de personnage 5e ont des listes de longueur variable : sorts
connus, objets d'inventaire, capacités, compétences maîtrisées. Deux
approches classiques : une colonne `Json` par liste (`spells: Json`,
`items: Json`) sur `Character`, ou une table normalisée par liste
(`CharacterSpell`, `InventoryItem`…).

## Décision
Table normalisée pour tout ce qui se mute **individuellement, ligne par
ligne** : `InventoryItem` (équipé, harmonisé, quantité), `CharacterSpell`
(préparé), `CharacterSkill` (maîtrise), `CharacterFeature` (utilisations
restantes). `Json` réservé au seul `srdSnapshot` : un texte figé, jamais
requêté champ par champ, jamais muté après écriture — un cache, pas de
l'état.

## Alternatives rejetées
Un `items: Json` sur `Character` aurait semblé plus simple au premier
abord, mais : cocher « équipé » sur un objet obligerait à lire tout le
blob, le désérialiser, muter l'entrée en TypeScript, et réécrire le blob
complet — avec un risque réel d'écrasement si le MJ et le joueur éditent
la fiche au même moment (deux écritures concurrentes sur la même colonne
`Json` ne se fusionnent pas, la dernière écrase l'autre en silence). Une
colonne `Json` interdit aussi l'index et le tri SQL, et complique le
typage côté Server Action (il faut transporter et valider tout le tableau
à chaque sauvegarde au lieu d'une seule ligne).

## Conséquences
- Plus de tables dans le schéma (~10 de plus) qu'une approche tout-Json,
  mais chacune reste à moins de 15 colonnes.
- Chaque mutation ponctuelle (cocher une case, changer une quantité) est
  une requête `UPDATE` ciblée sur une ligne, pas une réécriture complète —
  plus sûr sous édition concurrente et plus simple à exposer comme Server
  Action indépendante (voir `src/data/inventory.ts`).
- La règle se réévalue au cas par cas pour toute nouvelle liste ajoutée en
  v2+ : si l'élément est muté individuellement, table ; si c'est un
  instantané immuable, `Json` est acceptable.
