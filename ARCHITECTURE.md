# Architecture

## Vue d'ensemble

```
Navigateur
   │
   ▼
src/proxy.ts  ──────────────►  vérification OPTIMISTE (lit le cookie, ne touche jamais la base)
   │
   ▼
src/app/**/page.tsx  (Server Components)
src/app/actions/*.ts (Server Actions, 'use server')
   │
   ▼
src/lib/dal.ts  ──────────────►  LA barrière d'autorisation réelle (verifySession, requireDm,
   │                              assertCanEditCharacter) — appelée à l'intérieur de chaque
   │                              fonction de src/data/
   ▼
src/data/*.ts  (DAL par ressource, 'server-only')
   │
   ▼
src/lib/db.ts  (singleton PrismaClient + adaptateur Neon)
   │
   ▼
Neon Postgres
```

## La règle d'or

**Prisma n'est importable que depuis `src/data/` et `src/lib/db.ts`.**
Aucune page, aucun composant, aucune Server Action n'importe
`@/generated/prisma/client` ou `@/lib/db` directement — ils passent
toujours par une fonction de `src/data/`, qui elle-même appelle
`verifySession` / `getCurrentUser` / `assertCanEditCharacter` avant toute
requête. C'est ce qui garantit qu'aucune donnée ne peut être lue ou écrite
sans passer par le contrôle d'accès, même si quelqu'un oublie de vérifier
manuellement dans une page.

Cette règle est actuellement documentée mais pas encore appliquée par une
règle ESLint dédiée (`no-restricted-imports` sur `src/app/**` et
`src/components/**`) — c'est une amélioration listée dans
[ROADMAP.md](ROADMAP.md) « v1.1 — Confort ».

## Flux d'authentification

1. `src/lib/session.ts` — chiffre/déchiffre un JWT (bibliothèque `jose`)
   contenant `{ userId, role }`, posé dans un cookie `mimic-session`
   (`httpOnly`, `secure` en production, `sameSite: lax`, 7 jours).
2. `src/app/actions/auth.ts` — `login()` valide les identifiants (zod +
   `bcrypt.compare`), crée la session ; `logout()` la supprime. Ce sont des
   Server Actions, jamais un formulaire GET (une déconnexion en GET serait
   vulnérable au CSRF de déconnexion).
3. `src/lib/dal.ts` — `verifySession()` lit et vérifie le cookie,
   redirige vers `/login` si absent/invalide. Mémoïsé par requête via
   `cache()` (React), comme recommandé par la documentation Next.js livrée
   avec cette version (`node_modules/next/dist/docs/01-app/02-guides/
   authentication.md`).
4. `src/proxy.ts` — renommage de `middleware.ts` en Next 16. Fait
   uniquement des redirections **optimistes** (lit le cookie, ne
   déchiffre même pas côté base) : `/login` si non connecté, `/` si déjà
   connecté sur `/login`. **Ce n'est pas une barrière de sécurité** — voir
   ci-dessous.

### Pourquoi `proxy.ts` ne suffit pas

`middleware.ts` a été renommé `proxy.ts` en Next 16 précisément parce que
trop de projets y plaçaient leur SEULE logique d'autorisation — ce qui a
mené à [CVE-2025-29927](https://github.com/vercel/next.js/security/advisories/GHSA-f82v-jwr5-mffw)
(contournement possible sous forte charge, limites du runtime Edge). La
doctrine ici : le proxy est un confort UX (éviter un aller-retour serveur
inutile), **jamais** la seule chose qui empêche un accès non autorisé.
Chaque fonction de `src/data/` revérifie indépendamment.

## RSC vs Client Components

- Les pages (`page.tsx`) sont des Server Components asynchrones par
  défaut : elles lisent directement les fonctions de `src/data/`.
- `(app)/layout.tsx` **n'attend jamais** le DAL lui-même — un layout ne
  se re-rend pas à la navigation, et un `await` au sommet retiendrait tout
  `{children}` derrière la requête de session. Le menu utilisateur
  (`src/components/layout/site-header.tsx`) est un Server Component
  enfant, monté sous `<Suspense>`.
- Les formulaires interactifs (`use-theme.ts`, les formulaires d'édition
  de fiche/inventaire) sont des Client Components explicitement marqués
  `"use client"`, qui appellent des Server Actions via `useActionState`
  (progressive enhancement : ils fonctionnent en HTML pur, sans JS, via le
  mécanisme de formulaire natif de Next).

## Stratégie de cache

`cacheComponents` (Next 16) est **désactivé** en v1 — l'activer n'est pas
un simple renommage de flag (voir `.../02-guides/upgrading/version-16.md`),
et le site est petit (6 comptes) : la fraîcheur des données prime sur
l'optimisation de cache. Après une mutation, les Server Actions appellent
`revalidatePath()` sur les routes concernées (`/`, `/personnages/[slug]`,
`/mon-personnage`, `/mj`) — pas de `revalidateTag` en v1 (l'API existe
mais son 2ᵉ argument obligatoire, `'max'`, n'apporte rien tant qu'il n'y a
pas de tags fins à invalider séparément).

## Spécificités Next 16 à connaître avant de toucher au code

Cette version de Next diffère de manière significative de ce qu'un LLM ou
un développeur connaît par défaut — la documentation exacte est livrée
dans `node_modules/next/dist/docs/`, à consulter avant toute modification
substantielle. Points vérifiés et déjà appliqués dans ce repo :

| Point | Ce qui a changé | Où c'est appliqué ici |
|---|---|---|
| `params` / `searchParams` | Toujours des `Promise`, y compris dans `generateMetadata` | `personnages/[slug]/page.tsx`, `mj/personnages/[slug]/page.tsx` (`await props.params`) |
| `middleware.ts` → `proxy.ts` | Renommé, runtime Node forcé, vit dans `src/` (pas à la racine) | `src/proxy.ts` |
| Types de routes | `PageProps<'/route'>` / `LayoutProps<'/route'>` générés par `next typegen` | utilisés partout ; **limite constatée** : non générés pour un layout posé sur un route group comme `(auth)` ou `(app)` — typer alors `{ children: React.ReactNode }` à la main |
| `next lint` | Supprimé | `pnpm lint` appelle `eslint .` directement |
| `next/image` | `qualities` par défaut `[75]` ; une image locale avec query string exige `images.localPatterns.search` | portraits : jamais de `?v=` dans `portraitUrl`, renommer le fichier pour casser le cache |
| Config Prisma | `prisma.config.ts` **n'est pas** le nom attendu par la CLI 7.10 installée — c'est `prisma7.config.ts` (vérifié via `prisma init`) | `prisma7.config.ts` |

## Arborescence commentée

```
prisma/                  schema, migrations, seed (voir docs/DATA_MODEL.md)
prisma7.config.ts        config Prisma 7 (schema + datasource + commande de seed)
scripts/fetch-srd.ts     vendorise le SRD 5.1 FR dans src/srd/fr/
src/
  proxy.ts               redirections optimistes uniquement (voir plus haut)
  app/
    layout.tsx            polices next/font + script anti-flash du thème
    globals.css            le design system complet (voir la section Tailwind ci-dessous)
    design/                page kitchen-sink, dev only (404 en production)
    (auth)/login/          route publique
    (app)/                 tout le reste, derrière l'auth
      layout.tsx            en-tête sous <Suspense>
      page.tsx               roster
      personnages/[slug]/    fiche en lecture
      mon-personnage/        édition de sa propre fiche + inventaire
      mj/                    panneau MJ (accès requireDm())
    actions/               Server Actions 'use server' — valident, délèguent à src/data/, revalident
  data/                   DAL par ressource — SEUL point d'entrée vers Prisma en dehors de lib/db.ts
  lib/
    db.ts                  singleton Prisma + adaptateur Neon
    session.ts / dal.ts    authentification et autorisation
    rules/                 formules 5e PURES, sans I/O — testées (pnpm test)
    validation/            schémas zod des formulaires
    i18n/                  libellés français qui ne viennent pas du SRD
  srd/                    chargement + recherche du SRD FR vendorisé (server-only)
  components/
    ui/                    primitives visuelles génériques (Button, Field, Badge…)
    dnd/                   composants qui connaissent les règles 5e (StatBlock, HpBar…)
    theme/                 toggle de thème
```

## Le système de design (Tailwind v4, deux thèmes)

Voir directement les commentaires en tête de `src/app/globals.css`, qui
documentent le mécanisme — en résumé :

1. **Primitives** (`@theme static`) : palettes brutes (`--color-parchment-*`,
   `--color-ink-*`, `--color-blood-*`, `--color-gold-*`, `--color-leather-*`,
   `--color-cream-*`). Jamais utilisées directement dans les composants.
2. **Pont sémantique** (`@layer base`, CSS brut) : `:root`/`[data-theme="light"]`
   et `[data-theme="dark"]` redéfinissent des variables sémantiques
   (`--surface`, `--text`, `--accent`, `--ornament`…) à partir des primitives.
   **C'est ici que le thème bascule.**
3. **Exposition Tailwind** (`@theme inline`) : `--color-surface: var(--surface)`
   etc. — le mot-clé `inline` est **obligatoire** : il fait en sorte que
   l'utilitaire généré (`bg-surface`) compile en `background-color:
   var(--surface)`, résolu **sur l'élément peint**, et non en
   `var(--color-surface)`, qui se figerait à la valeur de `:root`.

> ⚠️ **Piège vécu et corrigé** : tout le CSS écrit à la main (le stat
> block, les cadres ornementaux, les barres de PV…) doit référencer les
> variables sémantiques **brutes** (`var(--accent)`, `var(--ornament)`…),
> jamais les noms `--color-*` réservés aux classes Tailwind générées. Une
> première version de ce fichier avait cette confusion partout : ça ne se
> voyait pas sur les pages normales (le thème est posé sur `<html>`, donc
> `:root` et l'élément coïncident), mais ça cassait silencieusement dès
> qu'un thème était forcé sur un élément imbriqué (typiquement la page
> `/design`, qui compare les deux thèmes côte à côte). Le commentaire dans
> `globals.css` au-dessus de la couche `@theme inline` rappelle la règle.

Le toggle clair/sombre/système est piloté par `src/lib/theme.ts` (source
de vérité partagée) + un script anti-flash inline dans `layout.tsx`
(pose `data-theme` sur `<html>` avant la première peinture) +
`src/components/theme/use-theme.ts` (hook React, synchronisé entre
onglets via l'événement `storage`).
