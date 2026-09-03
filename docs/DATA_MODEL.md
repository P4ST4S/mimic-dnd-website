# Modèle de données

Schéma source : [`prisma/schema.prisma`](../prisma/schema.prisma).

## Doctrine : colonne, table normalisée, ou `Json` ?

| Forme | Quand | Exemples dans ce schéma |
|---|---|---|
| **Colonne scalaire** | Arité fixe, toujours présente | Les 6 caractéristiques, les 5 monnaies, `hpCurrent`/`hpMax`/`hpTemp` |
| **`String[]` Postgres** | Liste plate de tags sans métadonnée par élément | `savingThrowProficiencies`, `conditions` |
| **Table normalisée** | L'élément est muté **individuellement**, trié ou filtré | `InventoryItem`, `CharacterSpell`, `CharacterSkill`, `CharacterFeature` |
| **`Json`** | Snapshot **immuable**, jamais requêté champ par champ | `srdSnapshot` (texte SRD figé au moment de l'ajout) |

Pourquoi pas un gros `Json` d'inventaire ou de sorts ? `equipped`,
`prepared`, `quantity` se cochent/s'incrémentent un par un. Avec une
colonne `items Json`, chaque clic obligerait à relire tout le blob, le
muter en TypeScript, et le réécrire en entier — ce qui écrase les
modifications concurrentes (le MJ et le joueur éditent en même temps),
interdit l'index et le tri SQL, et complique inutilement les Server
Actions. Une table dédiée coûte une dizaine de lignes de schéma et
supprime toute cette classe de bugs. Voir
[docs/adr/0005-tables-vs-json.md](adr/0005-tables-vs-json.md).

## Unités

- **Poids** : livres (`lb`), comme le Manuel des Joueurs français (le SRD
  garde les unités impériales même traduit).
- **Distance/vitesse** : pieds (`pi` / `ft` dans le code — `speedFt`).
- **Monnaie** : pièces (cuivre/argent/électrum/or/platine), une colonne par dénomination.

## Modèles

### `User`
Un compte (créé uniquement par le seed, pas d'inscription publique).
`role` détermine tout le contrôle d'accès (`PLAYER` édite sa propre fiche,
`DM` édite tout — voir `src/lib/dal.ts`). `mustChangePassword` est posé à
`true` par le seed quand le mot de passe a été généré automatiquement.

### `Campaign`
Une campagne = un MJ (`dmId`, colonne obligatoire — une campagne sans MJ
n'a pas de sens ici) + des personnages. `Character.campaignId` est
**nullable** dès la v1 : c'est la couture qui permettra le multi-campagnes
(v3.0) sans migration destructive.

### `Character`
Le cœur du schéma. `kind` (`PC` | `NPC`) est une amorce pour la future
galerie de PNJ (v2.1) — un PNJ complet réutilisera cette même table plutôt
qu'un modèle séparé. Les valeurs **calculables** (bonus de maîtrise,
perception passive) ne sont volontairement **pas stockées** : seuls les
`*Override` explicites le sont, tout le reste passe par
`src/lib/rules/` à la lecture. Invariants à respecter dans les Server
Actions (non contraints en base, à valider en zod) :

- `0 ≤ hpCurrent`, `hpCurrent` peut dépasser `hpMax` temporairement via `hpTemp`
- `0 ≤ deathSaveSuccesses, deathSaveFailures ≤ 3`
- `0 ≤ exhaustionLevel ≤ 6`

### `CharacterClass`
**Une ligne par classe** — c'est ce qui rend le multiclassage gratuit dès
la v1. Le bonus de maîtrise dépend du niveau **total** (`Σ level`), les
emplacements de sorts d'un niveau de lanceur composite (pleins lanceurs en
entier, demi-lanceurs à moitié, tiers-lanceurs au tiers — voir
`src/lib/rules/spellcasting.ts`), et les dés de vie sont **un pool par
classe** (`hitDieSize` + `hitDiceUsed` par ligne). L'UI v1 n'expose qu'une
seule classe par personnage, mais le schéma n'a pas cette limite.

### `CharacterSkill`, `CharacterProficiency`
Une ligne par compétence maîtrisée / par maîtrise d'arme-armure-outil-langue.
`ProficiencyLevel` va jusqu'à `EXPERTISE` (bonus de maîtrise ×2).

### `CharacterFeature`, `CharacterSpell`, `SpellSlot`
`SpellSlot.kind` distingue `STANDARD` (calcul multiclasse composite) de
`PACT` (magie de pacte du Sorcier — **jamais** additionnée aux emplacements
standards, voir `pactMagicSlots()` dans `lib/rules/spellcasting.ts`).
`srdSnapshot` (Json) fige la description française d'un sort/capacité au
moment où il est ajouté : la fiche reste lisible même si le SRD vendorisé
est resynchronisé ou modifié plus tard.

### `InventoryItem`
`attuned` (le personnage y est harmonisé) et `requiresAttunement`
(l'objet l'exige) sont deux booléens séparés — ce sont deux faits
distincts, l'un est une propriété de l'objet, l'autre un état du
personnage. La limite de 3 objets harmonisés simultanément (règle 5e)
n'est **pas** contrainte en base : elle se valide en TypeScript côté
Server Action. `weightLb` est un `Decimal(8,2)` — jamais un `Float`, pour
éviter les erreurs d'arrondi cumulées sur un inventaire à 30 lignes.

**Encombrement : calculé, jamais stocké** (`src/lib/rules/encumbrance.ts`).
Le stocker le rendrait périmé à chaque ajout/suppression d'objet et
forcerait une transaction à chaque mutation d'inventaire.

### `CharacterBio`
Relation 1:1, dans sa propre table pour garder `Character` étroite — ce
sont de longs blocs de texte (`@db.Text`), rarement lus en même temps que
les stats de combat.

### `CharacterNote`
`visibility` (`PUBLIC` | `PARTY` | `PRIVATE` | `DM_ONLY`) filtré **dans le
DAL** (`src/data/characters.ts`), jamais dans un composant — la même règle
s'applique à `InventoryItem.visibility` et `CharacterFeature.visibility`.

## La charnière i18n

**La base ne stocke que des slugs anglais** (`fireball`, `stealth`,
`chaotic-good`) dans les colonnes `*Index`, plus une copie dénormalisée du
libellé affiché dans `*Label` (ou `name` pour les sorts/objets). L'anglais
reste la clé stable, alignée sur l'écosystème 5e (D&D Beyond, Foundry,
tout export futur) ; changer la langue d'affichage = changer un fichier
JSON dans `src/srd/fr/` ou `src/lib/i18n/`, jamais une migration.

## Coutures de compatibilité (déjà en place, coût ≈ nul aujourd'hui)

| Couture | Débloque |
|---|---|
| `Character.campaignId` nullable | Multi-campagnes (v3.0) sans migration destructive |
| `Character.kind = PC \| NPC` | Galerie de PNJ (v2.1) — réutilise la fiche complète |
| Enum `Visibility` sur notes/objets/capacités | Déblocage progressif de contenu (Codex, v2.1) |
| `slug` unique sur `Character` / `Campaign` | URLs stables |
| `srdIndex` + `srdSnapshot` partout | Changement de langue ou de version du SRD sans perte |
| `SpellSlot.kind = PACT` | Magie de pacte (Sorcier) sans polluer le calcul multiclasse |
| `CharacterClass` en table dédiée | Multiclassage |
| `portraitUrl` = chaîne libre | Migration `public/` → stockage objet (Vercel Blob) sans migration SQL |

## Tables volontairement absentes de la v1

Documentées avec leur phase et leur couture dans [ROADMAP.md](../ROADMAP.md) :
`JournalEntry`/`TimelineEvent`/`SessionRecap` (Chronique), `Npc`/`Monster`/`Reveal`
(Codex — `Reveal` sera une table polymorphe plutôt qu'un booléen par
entité, car un déblocage est un événement daté avec un auteur, pas un
simple flag), `MapLayer`/`MapPin` (Cartographie), `PartyStash`/`StashItem`/
`LootTransfer` (Butin commun), `DiceRoll` (Statistiques de dés),
`CampaignMember` (multi-campagnes, remplacera le `Role` global sur `User`).
