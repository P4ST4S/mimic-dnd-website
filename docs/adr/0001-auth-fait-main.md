# ADR 0001 — Authentification faite main plutôt qu'Auth.js

## Statut
Acceptée.

## Contexte
Le site sert ~6 comptes, tous créés par un seed (pas d'inscription
publique, pas d'e-mail, pas d'OAuth). Deux options évaluées : (a) une
implémentation maison avec `bcryptjs` + `jose` (JWT en cookie httpOnly) +
un DAL, suivant la recette de la documentation Next.js livrée avec cette
version ; (b) Auth.js (next-auth) v5 avec un provider Credentials et un
adaptateur Prisma.

Au moment de la décision, `next-auth@latest` pointait vers `4.24.15` et la
v5 était toujours en statut bêta (`5.0.0-beta.32`, bêta depuis plus de
deux ans), avec des rapports de conflits de peer-dependencies contre
Next 16.

## Décision
Implémentation maison.

## Alternatives rejetées
Auth.js v5 aurait ajouté quatre tables (`Account`, `Session`,
`VerificationToken`, `Authenticator`) toutes inutiles ici (pas d'OAuth, pas
de magic link, pas de WebAuthn), une dépendance en bêta prolongée sur un
projet censé tourner sans maintenance active pendant des années, et un
pattern documenté qui suppose encore `middleware.ts` (renommé `proxy.ts`
en Next 16).

## Conséquences
- ~150 lignes de code (`session.ts`, `dal.ts`, `actions/auth.ts`), calquées
  sur la documentation Next.js officielle.
- Pas de social login, pas de MFA — non requis par le cahier des charges.
- Si le site s'ouvre un jour à un public plus large ou a besoin d'OAuth,
  cette décision sera à réévaluer (Auth.js v5 sera probablement stable
  d'ici là).
