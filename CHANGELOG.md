# Changelog

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

## [1.0.0] — 2026-09-03

### Ajouté

- Authentification maison (jose + bcryptjs), sessions par cookie httpOnly,
  comptes créés uniquement par seed
- Modèle de données complet : personnages multiclasses, compétences,
  capacités, sorts et emplacements (standards + magie de pacte), inventaire,
  bio, notes avec visibilité (public/groupe/privé/MJ)
- Roster, fiche de personnage en lecture, édition de sa propre fiche
  (caractéristiques, état de combat), inventaire éditable avec
  autocomplétion SRD et encombrement calculé, panneau MJ
- Design system Tailwind CSS 4 « D&D classique » : thèmes Parchemin
  (clair) et Grimoire (sombre), sans flash, avec système de tokens
  sémantiques à trois couches
- SRD 5.1 vendorisé en français (sorts, équipement, compétences,
  conditions, classes, races, historiques, alignements, langues) depuis
  5e-bits/5e-database, sous licence CC-BY-4.0
- Tests unitaires des formules 5e (`src/lib/rules/`)
- Documentation : ARCHITECTURE, DATA_MODEL, ROADMAP, CONTRIBUTING,
  RUNBOOK, SECURITY, ADRs
