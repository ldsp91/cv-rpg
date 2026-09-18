# Bun end-to-end: dev server and static build, no Vite

Context: the vision demands a deployable pure-static site; the original notes recommended Vite; the workspace `AGENTS.md` says "Don't use vite". We decided to use Bun for both halves of the toolchain: `bun --hot index.ts` (Bun.serve + HMR) for development, `bun build ./index.html --outdir dist --target browser --minify` for production.

Why: Bun's html loader is a first-class static build — verified against the current Bun docs (1.4 line) at decision time: `bun build` on an HTML entrypoint bundles and hashes every referenced script, stylesheet and image, and emits a plain `dist/` that any static host serves. One toolchain covers install, dev, test and build, and the no-vite workspace rule stays intact.

Considered options:
- **Vite**: a solid static builder, but it adds a second toolchain to a workspace with an explicit no-vite rule, for capability the vision never allocates.
- **Hand-rolled static build** (static HTML + separately bundled JS): forgoes asset bundling/hashing of referenced assets and keeps two build paths to reason about.
