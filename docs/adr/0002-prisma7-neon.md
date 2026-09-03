# ADR 0002 — Prisma 7 épinglé + Neon Postgres

## Statut
Acceptée.

## Contexte
Le projet a besoin d'une base relationnelle hébergée gratuitement,
accessible depuis Vercel (fonctions serverless, connexions courtes et
nombreuses) et depuis le poste de développement sous Windows. Au moment de
l'installation, `prisma@latest` sur le registre npm pointait vers
`8.0.0-rc.12` (une release candidate) alors que `@prisma/client@latest`
était en `7.10.0` — un décalage qui aurait cassé le projet si les paquets
avaient été installés sans version explicite.

## Décision
- **Prisma 7**, épinglé explicitement (`prisma`, `@prisma/client`,
  `@prisma/adapter-neon` tous en `7.10.0`), pas la dernière RC.
- **Neon Postgres** comme hébergeur, via `@prisma/adapter-neon` (driver
  adapter, compatible avec le runtime serverless de Vercel), avec deux
  chaînes de connexion : une poolée (`DATABASE_URL`, utilisée par l'app en
  runtime) et une directe (`DATABASE_URL_UNPOOLED`, exigée par les
  migrations Prisma).
- Config via `prisma7.config.ts` (Prisma 7 a supprimé le champ `"prisma"`
  de `package.json`) — nom de fichier vérifié empiriquement via
  `prisma init` avec la version installée, qui diffère de la convention
  `prisma.config.ts` documentée ailleurs.

## Alternatives rejetées
- **SQLite local** : pas d'accès depuis les téléphones des joueurs sans
  tunnel, et le site doit rester accessible quand l'ordinateur du MJ est éteint.
- **Vercel Postgres** : essentiellement un revendeur de Neon avec moins de
  contrôle direct sur le dashboard de la base.

## Conséquences
- Une mise à jour vers Prisma 8 (stable) sera à planifier plus tard, en
  suivant le guide officiel de migration majeure.
- Toute migration de production doit être lancée à la main contre
  `DATABASE_URL_UNPOOLED`, jamais comme effet de bord d'un build Vercel
  (voir docs/RUNBOOK.md).
