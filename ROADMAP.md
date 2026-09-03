# Roadmap

## v1.0 — Le Compagnon (ce qui existe aujourd'hui)

- Comptes créés par seed, connexion, sessions (`jose` + cookie httpOnly)
- Roster du groupe (`/`)
- Fiche de personnage complète en lecture (`/personnages/[slug]`) :
  caractéristiques, PV, CA, initiative, vitesse, bonus de maîtrise,
  perception passive, compétences, incantation (DD/bonus d'attaque/sorts),
  capacités, inventaire, historique, notes filtrées par visibilité
- Édition de sa propre fiche (`/mon-personnage`) : caractéristiques, état
  de combat (PV, PV temp., CA, inspiration)
- Inventaire éditable (`/mon-personnage/inventaire`) : ajout avec
  autocomplétion SRD, quantité, équipé/harmonisé, encombrement calculé
- Panneau MJ (`/mj`) : vue de tout le groupe, édition de n'importe quelle
  fiche avec les mêmes composants que côté joueur
- Thèmes Parchemin / Grimoire / Système, sans flash, persistant
- SRD 5.1 vendorisé en français (sorts, équipement, compétences,
  conditions, classes, races, historiques, alignements, langues)

### Connu, pas encore fait (à faire avant de considérer la v1 "complète")

- **Édition des compétences et des sorts** : le seed les peuple, mais
  aucune UI ne permet encore de les modifier depuis le site (seules les
  caractéristiques et l'état de combat ont un formulaire). Même pattern
  que `ability-scores-form.tsx` à répliquer.
- **Règle ESLint `no-restricted-imports`** pour faire respecter
  mécaniquement « Prisma seulement dans `src/data/` » (voir ARCHITECTURE.md)
- Upload de portrait (v1 : fichiers commités à la main dans `public/portraits/`)
- Tests d'intégration des Server Actions (v1 : seules les formules pures
  de `lib/rules/` sont testées)

## v1.1 — Confort

- Changement de mot de passe par l'utilisateur
- Repos court / repos long (réinitialise emplacements de sorts, dés de
  vie, capacités à recharge)
- Export PDF ou JSON de la fiche
- Upload de portrait via Vercel Blob (`portraitUrl` est déjà une chaîne
  libre — **aucune migration SQL** requise, voir docs/adr/0003)
- Règle ESLint ci-dessus

*Tables ajoutées : aucune.*

## v2.0 — La Chronique

Journal de campagne : résumés de séance rédigés par le MJ, frise
chronologique, commentaires des joueurs.

*Tables : `JournalEntry`, `TimelineEvent`, `SessionRecap`. Couture : `Campaign`.*

## v2.1 — Le Codex

Bestiaire et galerie de PNJ à déblocage progressif — le MJ révèle une
entrée après une rencontre (effet « brouillard de guerre »).

*Tables : `Monster`, `Npc`, `Reveal` (table polymorphe : `campaignId`,
`entityType`, `entityId`, `revealedAt`, `revealedById` — un déblocage est
un événement daté avec un auteur, pas un booléen). Couture : enum
`Visibility` déjà en place, `Character.kind = NPC` pour les PNJ à fiche complète.*

## v2.2 — La Cartographie

Carte du monde interactive, calques et marqueurs révélables au fil de la campagne.

*Tables : `MapLayer`, `MapPin` (coordonnées normalisées 0–1). Couture : `Reveal`.*

## v2.3 — Le Butin commun

Coffre de groupe, transferts d'objets tracés, bourse partagée.

*Tables : `PartyStash`, `StashItem` (même forme que `InventoryItem`),
`LootTransfer`. Couture : le schéma d'`InventoryItem` se duplique tel quel.*

## v2.4 — Les Statistiques de dés

Enregistrement des jets (si un bot/webhook Discord ou Foundry les
transmet), courbes, « qui rate le plus ses jets de sauvegarde ».

*Table : `DiceRoll` (`characterId`, `kind`, `formule`, `d20`, `total`, `rolledAt`).*

## v3.0 — Multi-campagnes

Sélecteur de campagne, rôles par campagne, archivage des campagnes terminées.

*Table : `CampaignMember` (`userId`, `campaignId`, `role`) — remplace le
`Role` global sur `User`. Couture : `Character.campaignId` est nullable
depuis la v1, exactement pour ce jour-là.*
