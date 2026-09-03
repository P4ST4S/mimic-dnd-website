# ADR 0003 — Portraits commités dans `public/`

## Statut
Acceptée (v1). Migration prévue en v1.1, voir Conséquences.

## Contexte
Chaque personnage a un portrait généré par IA. Trois options : (a)
fichiers commités dans `public/portraits/` ; (b) upload vers un stockage
objet (Vercel Blob) ; (c) URL externe brute (hébergeur tiers quelconque).

Pour ~6 personnages, générés une fois et changés rarement (peut-être deux
fois par an), le coût d'un flow d'upload complet (composant, Server
Action, gestion d'erreurs, configuration `remotePatterns`) dépasse la
valeur apportée en v1.

## Décision
`public/portraits/<slug>.webp`, commités dans le repo. `Character.portraitUrl`
reste une chaîne libre en base (`"/portraits/sylvaine.webp"`).

## Alternatives rejetées
- **Vercel Blob** : upload sans redéploiement, mais ajoute une dépendance,
  un quota, une configuration `remotePatterns`, et un flow d'upload à
  écrire — reporté en v1.1 (voir ROADMAP.md).
- **URL externe** : risque de lien mort, hotlinking, un `remotePatterns`
  par hébergeur, aucune garantie de format ou de taille.

## Conséquences
- Chaque changement de portrait = un commit + un redéploiement Vercel.
  Acceptable à cette fréquence.
- **Pas de `blurDataURL` généré** en v1 : `sharp` est bloqué par
  `pnpm-workspace.yaml` (`ignoredBuiltDependencies`), et débloquer son
  script de build natif sous Windows pour ce seul usage n'est pas
  justifié. Un dégradé CSS tient lieu de silhouette de chargement (voir
  `PortraitFrame`).
- Migration vers Vercel Blob (v1.1) : **sans migration SQL**, puisque
  `portraitUrl` est déjà une chaîne libre — il suffira d'écrire l'URL
  absolue du blob dans la même colonne et d'ajouter le pattern à
  `next.config.ts`.
