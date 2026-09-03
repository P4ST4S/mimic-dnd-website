# Sécurité

## Modèle de menace

Ce site sert un groupe fermé (~6 comptes), créés uniquement par le MJ via
le seed — pas d'inscription publique. Les données ne sont pas sensibles au
sens réglementaire (pas de paiement, pas de données de santé) : le pire
scénario réaliste est qu'un tiers non invité lise des fiches de
personnage ou une note de MJ pas encore révélée aux joueurs. Il n'y a pas
de PII au-delà d'une adresse e-mail par compte.

En conséquence :

- Pas d'authentification à deux facteurs, pas de limitation de débit sur
  la connexion (proportionné à 6 comptes connus) — à reconsidérer si le
  site s'ouvre un jour à un public plus large.
- Le mot de passe généré par le seed est affiché en clair dans la console
  **une seule fois** — voir docs/RUNBOOK.md pour la marche à suivre de
  transmission (message privé, jamais e-mail en clair ni canal public).

## Ce qui protège réellement les données

**`src/lib/dal.ts`, pas `src/proxy.ts`.** Le proxy (renommage de
`middleware.ts` en Next 16) ne fait que des redirections optimistes basées
sur la présence d'un cookie valide — il ne touche jamais la base et peut,
par nature du runtime, être contourné dans certaines conditions (c'est
précisément le contexte de
[CVE-2025-29927](https://github.com/vercel/next.js/security/advisories/GHSA-f82v-jwr5-mffw),
qui a motivé ce renommage). La vraie barrière est `verifySession()` /
`assertCanEditCharacter()` / `requireDm()`, appelée à l'intérieur de
**chaque** fonction de `src/data/`, jamais dans un composant seul.

## Secrets

- `SESSION_SECRET` signe les cookies de session (JWT `HS256` via `jose`).
  **Le faire tourner déconnecte immédiatement tout le monde** — c'est le
  bouton d'urgence en cas de compromission suspectée d'un cookie.
- `DATABASE_URL` / `DATABASE_URL_UNPOOLED` : à ne jamais committer (voir
  `.gitignore` — `.env*` est ignoré, seul `.env.example` est suivi).
- Une valeur différente de `SESSION_SECRET` doit être utilisée en
  environnement **Preview** Vercel qu'en **Production**.

## Mots de passe

`bcryptjs`, coût 12 — implémentation JS pure choisie pour tourner à
l'identique sur Windows en développement et sur Vercel en production, sans
binaire natif à compiler (voir docs/adr/0001-auth-fait-main.md). Une
migration vers `argon2` (cryptographiquement supérieur) resterait possible
plus tard via un rehash transparent à la prochaine connexion, si le besoin
se présentait.

## Dépendances

Le CI (à ajouter — voir ROADMAP.md v1.1) devrait faire tourner
`pnpm audit` périodiquement. En attendant, une revue manuelle est
recommandée avant chaque mise à jour majeure de Next, Prisma ou des
bibliothèques d'authentification.

## Signaler un problème

Projet privé de table — contactez directement le mainteneur plutôt que
d'ouvrir une issue publique si vous trouvez une faille.
