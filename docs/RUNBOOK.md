# Runbook — opérations courantes

## Créer un projet Neon

1. [console.neon.tech](https://console.neon.tech) → compte gratuit → **New Project**
2. Nom du projet : `mimic` (ou ce que vous voulez) — région conseillée :
   **AWS Europe (Frankfurt)** (`eu-central-1`), pour rester proche du groupe
3. Sur le dashboard du projet, ouvrez **Connection string** : Neon donne
   **deux** hôtes pour la même base — un avec `-pooler` dans le nom, un sans
4. Dans `.env` :
   - `DATABASE_URL` = la chaîne **avec** `-pooler`
   - `DATABASE_URL_UNPOOLED` = la même chaîne **sans** `-pooler`
5. `SESSION_SECRET` : générez-en un avec
   `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

## Ajouter un joueur

1. Éditez `prisma/seed.data.json` (gitignoré — jamais commité), ajoutez un
   objet dans `users` avec `email`, `displayName`, `role: "PLAYER"`, et un
   bloc `character` (voir `seed.data.example.json` pour le format complet :
   classe, niveau, caractéristiques…)
2. `pnpm db:seed`
3. Le mot de passe généré s'affiche **une seule fois** dans la console —
   transmettez-le par message privé (Discord/Signal), jamais par e-mail en
   clair ni dans un canal public
4. Le joueur devrait changer ce mot de passe à sa première connexion
   (`mustChangePassword` est posé à `true` — l'UI de changement de mot de
   passe est prévue en v1.1, voir ROADMAP.md ; en attendant, transmettez
   simplement le mot de passe généré tel quel)

## Réinitialiser un mot de passe

Ajoutez un champ `"password": "un-mot-de-passe-clair"` à l'entrée de
l'utilisateur dans `seed.data.json`, puis :

```powershell
pnpm exec prisma db seed -- --reset-passwords
```

⚠️ Ce flag régénère le mot de passe de **tous** les comptes sans champ
`password` explicite dans le fichier — les mots de passe existants des
autres joueurs seront remplacés par de nouvelles phrases de passe
générées. Retirez le champ `password` du fichier juste après (il ne doit
jamais rester en clair dans `seed.data.json`).

## Ajouter un portrait de personnage

1. Générez le portrait (ratio conseillé 832×1216, format WebP, qualité 80)
2. Placez-le dans `public/portraits/<slug-du-personnage>.webp`
3. Renseignez `portraitUrl: "/portraits/<slug>.webp"` sur le personnage
   (via Prisma Studio — `pnpm db:studio` — ou une future UI d'édition)
4. **Ne jamais** ajouter de query string (`?v=2`) : Next 16 exige alors
   `images.localPatterns.search` en config. Pour invalider un cache
   navigateur, renommez le fichier plutôt.

## Resynchroniser le SRD

```powershell
pnpm srd:sync
git add src/srd/fr
git commit -m "chore: resync SRD FR"
```

Source : les dumps JSON `fr-FR` de
[5e-bits/5e-database](https://github.com/5e-bits/5e-database) (SRD 5.1
officiel de Wizards of the Coast, CC-BY-4.0). Si un nom d'objet ou de sort
est manquant ou mal traduit, corrigez-le directement dans le fichier JSON
concerné sous `src/srd/fr/` — un `pnpm srd:sync` ultérieur écrasera le
correctif, donc reportez toute correction durable en amont (issue sur le
dépôt 5e-bits) ou dans un fichier séparé non écrasé par le script.

## Migrer le schéma en production

**Ne jamais** faire tourner les migrations comme effet de bord d'un
déploiement Vercel. À la main, une fois la migration testée en local :

```powershell
$env:DATABASE_URL_UNPOOLED = "<url directe de production>"
pnpm exec prisma migrate deploy
```

Puis, si nécessaire, lancez le seed une fois contre la prod de la même façon.

## Restaurer un point-in-time Neon

Dashboard Neon → onglet **Restore** du projet → choisissez un instant
(Neon conserve un historique glissant selon le plan). La restauration crée
une nouvelle branche de base — basculez `DATABASE_URL`/`DATABASE_URL_UNPOOLED`
dessus une fois vérifiée, plutôt que d'écraser directement la branche `main`.

## Rollback Vercel

Dashboard Vercel → onglet **Deployments** → sélectionnez un déploiement
antérieur → **Promote to Production**. N'oubliez pas qu'un rollback de
code ne défait pas une migration de base déjà appliquée — si le problème
vient d'une migration, restaurez plutôt un point-in-time Neon (ci-dessus).

## Pièges Windows / pnpm

- PowerShell n'a pas de préfixe `VAR=x commande` façon Bash : utilisez
  `$env:VAR = "x"; commande` (voir la section migration ci-dessus), ou
  laissez `import "dotenv/config"` (déjà en place dans `prisma7.config.ts`
  et le seed) charger le `.env` automatiquement.
- `sharp` et `unrs-resolver` sont dans `ignoredBuiltDependencies`
  (`pnpm-workspace.yaml`) : leurs scripts natifs sont bloqués par défaut.
  La v1 n'en a pas besoin (pas de génération de `blurDataURL`). Si un jour
  nécessaire : `pnpm approve-builds`.
- Un `pnpm add` de paquet Prisma sans version explicite peut installer une
  release candidate (`prisma@latest` pointait vers `8.0.0-rc.x` au moment
  de l'écriture) — toujours épingler `@7.x` pour les trois paquets Prisma
  ensemble (`prisma`, `@prisma/client`, `@prisma/adapter-neon`).
