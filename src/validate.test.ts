/**
 * Tests for the career-file validator rules (`src/validate.ts`).
 *
 * Seams: the public `validateCareer(raw: unknown): string[]` — given the
 * parsed shape of `data/career.jsonc`, it returns one friendly,
 * field-path-prefixed message per problem (empty array when valid).
 *
 * The real file is the baseline: it must pass with zero errors (no false
 * positives). Every rule is then exercised by mutating a structured clone —
 * quiz rules are exercised by installing a quiz challenge on a cloned
 * location (the real file's quiz challenge lives at locations[1],
 * "university").
 */
import { test, expect } from "bun:test";
import career from "../data/career.jsonc";
import { validateCareer } from "./validate";
import type { Career } from "./types";

const clone = (): Career => structuredClone(career);
const asAny = (c: Career) => c as unknown as {
  player: { name: unknown };
  world: { blurb: unknown };
  locations: {
    id: string;
    dialogue: string[];
    skills: unknown[];
    challenge: unknown;
  }[];
  gate?: unknown;
  [key: string]: unknown;
};

test("the real file passes with zero errors", () => {
  expect(validateCareer(career)).toEqual([]);
});

test("missing required top-level key (gate)", () => {
  const c = clone();
  delete asAny(c).gate;
  expect(validateCareer(c).some((e) => e.startsWith("gate:"))).toBe(true);
});

test("mistyped field (player.name = 42)", () => {
  const c = clone();
  asAny(c).player.name = 42;
  expect(validateCareer(c).some((e) => e.startsWith("player.name:"))).toBe(true);
});

test("unknown top-level key (loactions)", () => {
  const c = { ...clone(), loactions: [] };
  expect(validateCareer(c).some((e) => e.startsWith("loactions:"))).toBe(true);
});

test("duplicate location id reports on the later entry", () => {
  const c = clone();
  c.locations.push(structuredClone(c.locations[0]!));
  const errors = validateCareer(c);
  expect(errors.some((e) => e.startsWith("locations[4].id:") && e.includes("duplicate"))).toBe(true);
});

test("non-kebab id with a space (\"First Job\")", () => {
  const c = clone();
  asAny(c).locations[0]!.id = "First Job";
  expect(validateCareer(c).some((e) => e.startsWith("locations[0].id:"))).toBe(true);
});

test("non-kebab id with an underscore (\"first_job\")", () => {
  const c = clone();
  asAny(c).locations[1]!.id = "first_job";
  expect(validateCareer(c).some((e) => e.startsWith("locations[1].id:"))).toBe(true);
});

test("missing challenge", () => {
  const c = clone();
  delete (asAny(c).locations[1]! as { challenge?: unknown }).challenge;
  expect(validateCareer(c).some((e) => e.startsWith("locations[1].challenge:"))).toBe(true);
});

test("unknown challenge type lists the allowed values", () => {
  const c = clone();
  asAny(c).locations[1]!.challenge = { type: "riddle" };
  const errors = validateCareer(c);
  expect(
    errors.some(
      (e) =>
        e.startsWith("locations[1].challenge.type:") &&
        e.includes("talk") &&
        e.includes("quiz") &&
        e.includes("coding"),
    ),
  ).toBe(true);
});

test("talk challenge with an extra payload key", () => {
  const c = clone();
  asAny(c).locations[0]!.challenge = { type: "talk", questions: [] };
  expect(validateCareer(c).some((e) => e.startsWith("locations[0].challenge.questions:"))).toBe(true);
});

test("quiz answer out of range names the answer field", () => {
  const c = clone();
  asAny(c).locations[2]!.challenge = {
    type: "quiz",
    questions: [{ question: "Which is JavaScript?", options: ["Pip", "NPM", "Cargo"], answer: 3 }],
  };
  expect(
    validateCareer(c).some((e) => e.startsWith("locations[2].challenge.questions[0].answer:")),
  ).toBe(true);
});

test("coding challenge with zero blanks", () => {
  const c = clone();
  asAny(c).locations[3]!.challenge = {
    type: "coding",
    context: "c",
    code: "return user.age >= 18;",
    fix: ">=",
    explanation: "e",
  };
  expect(validateCareer(c).some((e) => e.startsWith("locations[3].challenge.code:"))).toBe(true);
});

test("coding challenge with two blanks", () => {
  const c = clone();
  asAny(c).locations[3]!.challenge = {
    type: "coding",
    context: "c",
    code: "a ____ b ____ c",
    fix: ">=",
    explanation: "e",
  };
  expect(validateCareer(c).some((e) => e.startsWith("locations[3].challenge.code:"))).toBe(true);
});

test("coding challenge with a mistyped five-underscore blank reports zero blanks", () => {
  const c = clone();
  asAny(c).locations[3]!.challenge = {
    type: "coding",
    context: "c",
    code: "user.age _____ 18",
    fix: ">=",
    explanation: "e",
  };
  const errors = validateCareer(c);
  expect(
    errors.some(
      (e) =>
        e.startsWith("locations[3].challenge.code:") &&
        e.includes("found 0"),
    ),
  ).toBe(true);
});

test("coding challenge with empty fix", () => {
  const c = clone();
  asAny(c).locations[3]!.challenge = {
    type: "coding",
    context: "c",
    code: "user.age ____ 18",
    fix: "",
    explanation: "e",
  };
  expect(validateCareer(c).some((e) => e.startsWith("locations[3].challenge.fix:"))).toBe(true);
});

test("empty dialogue", () => {
  const c = clone();
  asAny(c).locations[0]!.dialogue = [];
  expect(validateCareer(c).some((e) => e.startsWith("locations[0].dialogue:"))).toBe(true);
});

test("empty skills", () => {
  const c = clone();
  asAny(c).locations[0]!.skills = [];
  expect(validateCareer(c).some((e) => e.startsWith("locations[0].skills:"))).toBe(true);
});

test("world with mistyped blurb", () => {
  const c = clone();
  asAny(c).world.blurb = 7;
  expect(validateCareer(c).some((e) => e.startsWith("world.blurb:"))).toBe(true);
});

test("non-object root reports a single root-level error", () => {
  expect(validateCareer([1, 2])).toEqual([
    "(root): expected the career file to be a JSON object",
  ]);
  expect(validateCareer("nope")).toEqual([
    "(root): expected the career file to be a JSON object",
  ]);
});

test("missing required top-level key (player)", () => {
  const c = clone();
  delete (asAny(c) as { player?: unknown }).player;
  expect(validateCareer(c).some((e) => e.startsWith("player:"))).toBe(true);
});

test("project entry with mistyped html names the field", () => {
  const c = clone();
  c.projects[0]!.html = 42 as unknown as string;
  expect(
    validateCareer(c).some((e) => e.startsWith("projects[0].html:")),
  ).toBe(true);
});
