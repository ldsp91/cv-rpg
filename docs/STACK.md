# Resume RPG — Stack

Chosen at scaffold time (2026-07-12). Every version below was verified against npm/docs on that date. The vision's scope is the budget: nothing here buys capability the scope never allocates.

## Language & runtime

- **TypeScript** (strict, existing `tsconfig.json`), running on **Bun 1.4** (bun 1.4.2 installed locally; v1.4 line current, actively maintained).
- TypeScript for a browser game is the workspace convention and the only language in play; the vision's "responsive browser UI" rules out anything else.

## Frameworks

- **Phaser 4 (pinned `4.2.1`)** — the 2D game engine for the world: tilemap, pixel-art sprites, keyboard input, scenes, triggers. Verified: v4.2.1 published 2026-07-09; stable line since April 2026; ESM + bundled TS types; one runtime dependency (eventemitter3).
  - Why it serves the vision: tilemap/sprites/keyboard/triggers are exactly the mechanics in scope; "small playable world" fits a scene-per-room structure.
  - Lost alternatives: **Kaplay** (Kaboom's successor — last release 2025-06-15, stalled), **PixiJS 8.21.0** (WebGL renderer only, no game loop), **bare canvas** (hand-rolled tilemap/collision/input for the same scope). See ADR-0001.
- **React (pinned `19.3.0`, with `react-dom 19.3.0`)** — the DOM overlay: landing, dialogue, character sheet, CV, projects.
  - Why it serves the vision: content is HTML by definition; the CV must be responsive, accessible, printable.
  - Lost alternative: plain TS views layer (reimplements state wiring the workspace flow already provides).

## Integration rule

Phaser boots exactly once into the stable `#game` container; React owns `#ui` and never re-renders the game canvas. See ADR-0003.

## Tooling

- **Package manager**: Bun.
- **Dev server**: `bun --hot index.ts` — `Bun.serve` with the HTML import, bundling on the fly with HMR (the AGENTS.md-documented flow).
- **Production build**: `bun build ./index.html --outdir dist --target browser --minify` — Bun's html loader bundles and hashes all referenced assets into a plain static `dist/`. Verified first-class in the current Bun docs.
  - Lost alternatives: **Vite** (workspace rule "Don't use vite"; second toolchain for the same output), hand-rolled static build (no asset hashing/bundling). See ADR-0002.
- **Tests**: `bun test` (workspace convention).
- **Type checking**: `tsc --noEmit` (strict). No ESLint/Prettier in v1 — the workspace ships no lint convention and the scope is small; add later if it earns its place.
- **Versions pinned at decision time**: `@types/bun 1.4.2`, `@types/react 19.3.0`, `@types/react-dom 19.3.0`.

## Data storage

- **The Career file** — one JSON file (`data/career.json`) holding all career content, text as HTML. Static-imported (Bun inlines it into the bundle at build time), so no `fetch()` and no `file://`/subpath issues.
- **No persistence in v1**: the game is short; the user decided localStorage "too short to care" for now. The vision allows `localStorage` at most, so a save layer can be added later without breaking anything.
- No backend, no database, no accounts — per the vision's explicit no list.

## Deployment

- **GitHub Pages** — the repo already lives on GitHub (`ldsp91/cv-rpg`); `.github/workflows/deploy.yml` runs `bun install --frozen-lockfile` + `bun run build` and uploads `dist/` via the official Pages actions on push to `main`.
- Bun's static build emits relative asset paths, so the site works under the `username.github.io/repo/` subpath without config.
- Lost alternatives: Cloudflare Pages, Netlify (both fine; each adds a new account/service for the same outcome).
- Art assets: free/public only (vision no-list). Convention: source assets live in `assets/`, imported from TS so the Bun bundler copies/hashes them into `dist/`.

## Directory layout

```
index.ts                  dev-server entry (Bun.serve)
index.html                HTML shell; references src/main.tsx + src/styles.css
src/
  main.tsx                entry: boots Phaser into #game, React into #ui
  styles.css              overlay + page styles
  game/                   Phaser scenes, input, world  (implementation)
  ui/                     React components: landing, dialogue, sheet, cv, projects
  state/                  shared game state (skills, quests)
data/
  career.json             the Career file (placeholder until real content is written)
assets/                   sprites/tilesets (free assets only)
career.test.ts            smoke test
docs/                     VISION.md, STACK.md, adr/
```

## Open items handed to the real work

- Real career entries in `data/career.json` (the vision's open question — entries still to be written).
- World naming/theme (ACADEMIA, TECH CITY, …) — placeholders until content is settled.
- Final boss mechanic — a metaphor, not a design yet.
