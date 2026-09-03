# Mimic — le compagnon de campagne de la table

Un site pour accompagner notre campagne de D&D 5e : chaque joueur a son
compte, sa fiche de personnage complète, son inventaire et ses infos
in-game. On garde les figurines, le plateau et les dés à table — ce site
est le petit plus entre deux sessions (et sur le téléphone pendant la
partie).

## Démarrer en local

Prérequis : Node ≥ 22, [pnpm](https://pnpm.io) 10, et un projet
[Neon](https://neon.tech) (Postgres gratuit).

```powershell
pnpm install                              # 1. dépendances
Copy-Item .env.example .env               # 2. variables d'environnement
# éditez .env : collez vos deux URLs Neon + générez SESSION_SECRET
#   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
pnpm exec prisma migrate dev --name init  # 3. crée les tables sur Neon
Copy-Item prisma/seed.data.example.json prisma/seed.data.json
# éditez seed.data.json avec les vrais joueurs de la table
pnpm db:seed                              # 4. crée les comptes + personnages
pnpm srd:sync                             # 5. (optionnel) resynchronise le SRD FR
pnpm dev                                  # 6. http://localhost:3000
```

Voir [docs/RUNBOOK.md](docs/RUNBOOK.md) pour la marche à suivre détaillée
(créer un projet Neon, ajouter un joueur, changer un mot de passe, resync
SRD, déployer, restaurer un backup).

## Scripts

| Commande | Rôle |
|---|---|
| `pnpm dev` | Serveur de développement (Turbopack) |
| `pnpm build` / `pnpm start` | Build et lancement en production |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint (`next lint` a été supprimé en Next 16) |
| `pnpm test` | Tests unitaires des formules 5e (Vitest) |
| `pnpm db:migrate` | Nouvelle migration Prisma |
| `pnpm db:seed` | (Re)joue le seed — idempotent |
| `pnpm db:studio` | Explorateur de données Prisma Studio |
| `pnpm srd:sync` | Retélécharge et vendorise le SRD 5.1 FR |

## Variables d'environnement

Voir [.env.example](.env.example) — `DATABASE_URL` (connexion poolée,
utilisée par l'app), `DATABASE_URL_UNPOOLED` (connexion directe, exigée
par les migrations Prisma), `SESSION_SECRET` (signature des sessions).

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4
(thèmes Parchemin/Grimoire, voir [ARCHITECTURE.md](ARCHITECTURE.md)) ·
Prisma 7 + Neon Postgres · authentification maison (`jose` + `bcryptjs`,
voir [docs/adr/0001-auth-fait-main.md](docs/adr/0001-auth-fait-main.md)).

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) — comment le projet est structuré et pourquoi
- [docs/DATA_MODEL.md](docs/DATA_MODEL.md) — chaque modèle, champ par champ
- [ROADMAP.md](ROADMAP.md) — ce qui existe (v1) et ce qui viendra (v2+)
- [CONTRIBUTING.md](CONTRIBUTING.md) — conventions de travail sur le repo
- [docs/RUNBOOK.md](docs/RUNBOOK.md) — opérations courantes
- [SECURITY.md](SECURITY.md) — modèle de menace et bonnes pratiques
- [docs/adr/](docs/adr/) — les décisions structurantes et pourquoi

## Licence & attribution

Code sous licence privée (projet de table, non destiné à la redistribution).

Ce site contient du contenu du **System Reference Document 5.1** de
*Dungeons & Dragons*, © Wizards of the Coast LLC, disponible sous licence
[Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/legalcode)
via [le dépôt 5e-bits/5e-database](https://github.com/5e-bits/5e-database).
D&D, Dungeons & Dragons et leurs logos sont des marques de Wizards of the
Coast LLC ; ce projet n'est ni produit ni approuvé par Wizards of the Coast.
