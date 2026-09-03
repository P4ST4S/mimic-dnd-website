# Contribuer

Ce projet est maintenu pour et par la table — ces conventions existent
pour que le code reste cohérent d'une session de travail à l'autre.

## Langue

- **URLs, UI, messages d'erreur, commentaires de code : en français.**
- **Identifiants (variables, fonctions, noms de fichiers), types, clés de
  base de données : en anglais**, sauf quand une valeur EST une donnée
  française à afficher (`raceLabel`, `classLabel`, les libellés SRD).
- Les slugs stockés en base restent en anglais même si l'UI est en
  français (voir docs/DATA_MODEL.md § « charnière i18n ») — c'est la clé
  stable, pas un choix de langue.

## Avant de committer

```powershell
pnpm typecheck
pnpm lint
pnpm test
```

`next build` ne fait plus de lint en Next 16 — ces trois commandes sont la
CI de fait pour un projet de cette taille.

## Style de commit

[Conventional Commits](https://www.conventionalcommits.org/) : `feat:`,
`fix:`, `docs:`, `refactor:`, `chore:`. Un commit = un changement
compréhensible isolément.

## Migrations Prisma

- Une migration déjà appliquée (committée, poussée) **ne se modifie
  jamais** — on en crée une nouvelle par-dessus (`pnpm db:migrate`).
- Ne jamais lancer `prisma migrate deploy` depuis la commande de build
  Vercel : les migrations s'appliquent à la main, volontairement, jamais
  comme effet de bord d'un déploiement (voir docs/RUNBOOK.md).
- Toute nouvelle table/colonne significative mérite une entrée dans
  `docs/DATA_MODEL.md` et, si la décision est structurante, un ADR dans
  `docs/adr/`.

## Ajouter une fonctionnalité qui touche aux données

1. Modifier `prisma/schema.prisma`, `pnpm exec prisma migrate dev --name ...`
2. Ajouter les fonctions d'accès dans `src/data/<ressource>.ts` — elles
   appellent `verifySession`/`assertCanEditCharacter`/`requireDm` en
   premier, **avant** toute requête Prisma (voir ARCHITECTURE.md § « La
   règle d'or »)
3. Si c'est une mutation : une Server Action dans `src/app/actions/`, qui
   valide en zod, délègue à `src/data/`, puis `revalidatePath()`
4. Jamais d'import de `@/generated/prisma/*` ou `@/lib/db` en dehors de
   `src/data/`

## Ajouter une formule de règle 5e

Dans `src/lib/rules/` — fonction pure, sans I/O, avec son test dans
`*.test.ts` à côté. C'est la seule partie du projet couverte par des tests
unitaires (voir `pnpm test`) : c'est là que se cachent les bugs
silencieux (un mauvais arrondi de bonus de maîtrise ne plante jamais, il
donne juste un chiffre faux sur une fiche).

## Design system

Avant d'ajouter une couleur ou un composant visuel, lire les commentaires
en tête de `src/app/globals.css` et `ARCHITECTURE.md` § « Le système de
design ». Règle non négociable : le CSS écrit à la main référence les
variables sémantiques **brutes** (`var(--accent)`), jamais les noms
`--color-*` réservés aux classes Tailwind générées — voir l'exemple de bug
documenté dans ARCHITECTURE.md.
