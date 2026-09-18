/**
 * `bun run check` — the validator's only I/O. The rules themselves are pure
 * in `src/validate.ts` (covered by `bun test`).
 *
 * Loads `data/career.jsonc` (Bun's jsonc loader: comments + trailing commas
 * allowed), guards against content after the closing "}", runs every
 * field-level rule, and exits 1 with one friendly, field-path-prefixed
 * message per problem — 0 with a short OK line when the file is clean.
 */
import { validateCareer } from "./src/validate";

const FILE = "data/career.jsonc";

let text: string;
try {
  text = await Bun.file(FILE).text();
} catch (e) {
  const complaint = e instanceof Error ? e.message : String(e);
  console.error(`${FILE} could not be read: ${complaint}`);
  process.exit(1);
}

// Bun's jsonc loader stops at the end of the first complete JSON value, so
// stray text after the closing "}" (e.g. a half-pasted extra entry) would
// be silently dropped — catch it here, before the parse.
const trimmed = text.trim();
if (trimmed.length === 0) {
  console.error(`${FILE} is empty`);
  process.exit(1);
}
const lastBrace = trimmed.lastIndexOf("}");
if (lastBrace === -1 || trimmed.slice(lastBrace + 1).trim() !== "") {
  console.error(`${FILE}: unexpected content after the closing "}" — the file must be one JSON object`);
  process.exit(1);
}

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
