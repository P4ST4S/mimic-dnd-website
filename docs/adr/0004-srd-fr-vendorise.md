# ADR 0004 — SRD 5.1 français vendorisé, pas de fetch au runtime

## Statut
Acceptée.

## Contexte
Le site a besoin de données de référence 5e (sorts, équipement,
compétences, conditions…) pour l'autocomplétion de l'inventaire et
l'affichage des fiches. Le groupe joue en français — hypothèse de départ :
seul l'anglais serait disponible. Vérification faite : le SRD 5.1 a été
officiellement traduit en français par Wizards of the Coast (publié en
janvier 2023, licence CC-BY-4.0), et le dépôt
[5e-bits/5e-database](https://github.com/5e-bits/5e-database) en propose
des dumps JSON structurés (`src/2014/fr-FR/`), incluant les noms
d'équipement (contrairement à une hypothèse initiale basée sur un test de
l'API live `dnd5eapi.co?lang=fr-FR`, qui elle ne traduit pas l'équipement
— la donnée existe dans le dataset statique, seule cette API-là ne
l'expose pas).

## Décision
`scripts/fetch-srd.ts` télécharge et élague les fichiers `fr-FR`, écrit le
résultat dans `src/srd/fr/*.json` (~650 Ko au total), **commité** dans le
repo. `src/srd/index.ts` (marqué `server-only`) charge cet index en
mémoire pour la recherche ; aucune donnée SRD n'atteint le bundle client.

## Alternatives rejetées
- **Fetch au runtime vers l'API live** : latence sur chaque
  autocomplétion, dépendance de disponibilité à un service tiers, builds
  non déterministes, et impossibilité de corriger une traduction
  manquante ou erronée sans attendre l'amont.
- **API anglaise uniquement + traduction manuelle complète** : travail de
  traduction inutile puisque la traduction officielle existe déjà.

## Conséquences
- Attribution CC-BY-4.0 obligatoire, présente dans README.md.
- Le SRD reste figé à la version 2014 (pas de `fr-FR` disponible pour la
  révision 2024 dans ce dépôt au moment de la décision) — cohérent avec
  une table qui joue en 5e "classique".
- `pnpm srd:sync` doit être relancé manuellement pour toute mise à jour ;
  toute correction de traduction faite à la main dans `src/srd/fr/*.json`
  sera écrasée au prochain sync (voir docs/RUNBOOK.md).
- Les clés stockées en base restent des slugs anglais (`fireball`), la
  traduction française n'étant qu'un affichage — voir docs/DATA_MODEL.md
  § « charnière i18n ».
