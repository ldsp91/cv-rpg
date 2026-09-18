/**
 * Type declaration for `data/career.jsonc` (TypeScript does not parse .jsonc
 * itself — Bun's jsonc loader does, at runtime and at build time).
 *
 * When a file is imported as `data/career.jsonc`, tsc resolves this
 * declaration instead of the `*.jsonc` wildcard (which types it as `any`),
 * so the import is typed as the settled `Career` shape end-to-end. The
 * runtime shape is still proven by the smoke test (career.test.ts) and by
 * `bun run check`. Keep this declaration in sync with `src/types.ts`.
 */
import type { Career } from "../src/types";

declare const career: Career;
export default career;
