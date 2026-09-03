<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Règles du projet Mimic

- Lire [ARCHITECTURE.md](ARCHITECTURE.md) avant toute modification
  substantielle — en particulier « La règle d'or » (Prisma n'est
  importable que depuis `src/data/` et `src/lib/db.ts`).
- URLs, UI et commentaires en français ; identifiants et types en anglais
  (voir [CONTRIBUTING.md](CONTRIBUTING.md)).
- Avant de committer : `pnpm typecheck && pnpm lint && pnpm test`.
- Ne jamais committer `.env`, `prisma/seed.data.json`, ou
  `src/generated/prisma/` (déjà dans `.gitignore`).
- Le CSS écrit à la main dans `src/app/globals.css` référence les
  variables sémantiques brutes (`var(--accent)`), jamais les noms
  `--color-*` réservés aux classes Tailwind générées — voir le commentaire
  en tête du fichier et ARCHITECTURE.md pour l'explication complète.
