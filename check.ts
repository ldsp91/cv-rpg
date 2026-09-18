/**
 * `bun run check` — the validator's only I/O. The rules themselves are pure
 * in `src/validate.ts` (covered by `bun test`).
 *
 * Loads `data/career.jsonc` (Bun's jsonc loader: comments + trailing commas
 * allowed), runs every field-level rule, and exits 1 with one friendly,
 * field-path-prefixed message per problem — 0 with a short OK line when the
 * file is clean.
 */
import { validateCareer } from "./src/validate";

const FILE = "data/career.jsonc";

let file: unknown;
try {
  // tsc types `mod.default` as `Career` through data/career.jsonc.d.ts;
  // validateCareer takes `unknown`, so no cast is needed for the rules.
  const mod = await import("./data/career.jsonc");
  file = mod.default;
} catch (e) {
  const complaint = e instanceof Error ? e.message : String(e);
  console.error(`${FILE} could not be loaded: ${complaint}`);
  process.exit(1);
}

const errors = validateCareer(file);
if (errors.length > 0) {
  for (const message of errors) console.error(message);
  process.exit(1);
}

const count = (file as { locations?: unknown[] }).locations?.length ?? 0;
console.log(`OK — ${FILE} passes: ${count} locations, one challenge each, gate at the far end.`);
