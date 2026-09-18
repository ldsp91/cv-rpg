import { test, expect } from "bun:test";
import career from "../data/career.jsonc";
import type { Career, Location } from "./types";
import {
  deriveCV,
  layoutOrder,
  isGateOpen,
  aggregateSkills,
  unlockedSkills,
  fixMatches,
  quizAnswerIsCorrect,
} from "./career";

// --- helpers ---------------------------------------------------------------

function syntheticLocation(
  overrides: Partial<Location> & { id: string },
): Location {
  return {
    title: `Title ${overrides.id}`,
    period: "2000 – 2001",
    dialogue: ["<p>hi</p>"],
    challenge: { type: "talk" },
    skills: [],
    ...overrides,
  };
}

function syntheticCareer(locations: Location[]): Career {
  return {
    player: {
      name: "Test",
      headline: "Test",
      summary: "<p>summary</p>",
      links: [],
    },
    locations,
    projects: [],
    gate: { title: "Gate", html: "<p>gate</p>" },
  };
}

// --- deriveCV ----------------------------------------------------------------

test("deriveCV: composes player fields and one experience entry per Location", () => {
  const cv = deriveCV(career);

  expect(cv.name).toBe(career.player.name);
  expect(cv.headline).toBe(career.player.headline);
  expect(cv.summary).toBe(career.player.summary);
  expect(cv.links).toEqual(career.player.links);

  expect(cv.experience).toEqual(
    career.locations.map((loc) => ({
      title: loc.title,
      period: loc.period,
      skills: loc.skills,
    })),
  );

  // In the real file: four entries, in timeline order, correct titles/periods.
  expect(cv.experience.map((e) => e.title)).toEqual([
    "High School",
    "University",
    "First Job",
    "Current Role",
  ]);
  expect(cv.experience.map((e) => e.period)).toEqual([
    "2010 – 2014",
    "2014 – 2018",
    "2018 – 2022",
    "2022 – present",
  ]);
  expect(cv.experience[0]!.skills).toEqual(career.locations[0]!.skills);
  expect(cv.experience[3]!.skills).toEqual(career.locations[3]!.skills);
});

test("deriveCV: the gate never leaks into the CV", () => {
  const cv = JSON.stringify(deriveCV(career));
  expect(cv).not.toContain(career.gate.title);
  expect(cv).not.toContain(career.gate.html);
});

test("deriveCV: a career with zero locations has an empty experience list", () => {
  expect(deriveCV(syntheticCareer([])).experience).toEqual([]);
});

// --- layoutOrder -------------------------------------------------------------

test("layoutOrder: returns location ids in file (timeline = map) order", () => {
  expect(layoutOrder(career)).toEqual([
    "school",
    "university",
    "first-job",
    "current-role",
  ]);
});

test("layoutOrder: synthetic career keeps array order, empty file is empty", () => {
  expect(
    layoutOrder(syntheticCareer([syntheticLocation({ id: "b" }), syntheticLocation({ id: "a" })])),
  ).toEqual(["b", "a"]);
  expect(layoutOrder(syntheticCareer([]))).toEqual([]);
});

// --- isGateOpen ----------------------------------------------------------------

test("isGateOpen: true when every real location is completed", () => {
  expect(
    isGateOpen(career, new Set(["school", "university", "first-job", "current-role"])),
  ).toBe(true);
});

test("isGateOpen: false when any one location is missing", () => {
  const all = career.locations.map((l) => l.id);
  for (const missing of all) {
    const done = new Set(all.filter((id) => id !== missing));
    expect(isGateOpen(career, done)).toBe(false);
  }
  expect(isGateOpen(career, new Set())).toBe(false);
});

test("isGateOpen: a career with zero locations is open by default", () => {
  expect(isGateOpen(syntheticCareer([]), new Set())).toBe(true);
});

test("isGateOpen: extra completed ids do not hurt", () => {
  const done = new Set(career.locations.map((l) => l.id));
  done.add("a-ghost-location");
  expect(isGateOpen(career, done)).toBe(true);
});

// --- aggregateSkills -----------------------------------------------------------

test("aggregateSkills: every real skill appears, tagged with its Location", () => {
  const skills = aggregateSkills(career);

  const expected = career.locations.flatMap((loc) =>
    loc.skills.map((skill) => ({
      skill,
      locationId: loc.id,
      locationTitle: loc.title,
      period: loc.period,
    })),
  );
  expect(skills).toEqual(expected);

  expect(skills).toHaveLength(8);
});

test("aggregateSkills: a name at two Locations yields two entries", () => {
  const skills = aggregateSkills(career);
  const ts = skills.filter((s) => s.skill.name === "TypeScript");

  expect(ts).toHaveLength(2);
  expect(ts.map((s) => s.locationId)).toEqual(["first-job", "current-role"]);
  expect(ts.map((s) => s.locationTitle)).toEqual([
    "First Job",
    "Current Role",
  ]);
  expect(ts.map((s) => s.period)).toEqual(["2018 – 2022", "2022 – present"]);
});

test("aggregateSkills: empty career yields an empty list", () => {
  expect(aggregateSkills(syntheticCareer([]))).toEqual([]);
});

// --- unlockedSkills ------------------------------------------------------------

test("unlockedSkills: nothing complete reveals nothing", () => {
  expect(unlockedSkills(career, new Set([]))).toEqual([]);
});

test("unlockedSkills: reveals completed Locations only, in file order, tagged", () => {
  const partial = unlockedSkills(career, new Set(["first-job"]));

  expect(partial.map((e) => e.locationId)).toEqual(["first-job", "first-job"]);
  expect(partial.map((e) => e.skill.name)).toEqual(["TypeScript", "React"]);
  expect(partial.every((e) => e.locationTitle === "First Job")).toBe(true);
  expect(partial.every((e) => e.period === "2018 – 2022")).toBe(true);

  // All complete: exactly the aggregate, order preserved.
  const all = new Set(career.locations.map((l) => l.id));
  expect(unlockedSkills(career, all)).toEqual(aggregateSkills(career));
});

test("unlockedSkills: a skill at two Locations yields one entry per completed Location", () => {
  const both = unlockedSkills(
    career,
    new Set(["first-job", "current-role"]),
  ).filter((e) => e.skill.name === "TypeScript");
  expect(both.map((e) => e.locationId)).toEqual(["first-job", "current-role"]);

  // Only one of the two completed: exactly one entry, tagged accordingly.
  const only = unlockedSkills(career, new Set(["current-role"]))
    .filter((e) => e.skill.name === "TypeScript");
  expect(only.map((e) => e.locationId)).toEqual(["current-role"]);
});

// --- fixMatches (ADR-0005) ------------------------------------------------------

test("fixMatches: ADR-0005 lenient cases", () => {
  expect(fixMatches(">=", " >= ")).toBe(true);
  expect(fixMatches(">=", "> =")).toBe(false);
  expect(fixMatches("return", "Return")).toBe(false);
  expect(fixMatches("a  b", "a b")).toBe(true);
});

test("fixMatches: exact match is true; empty typed is false", () => {
  expect(fixMatches(">= ", ">= ")).toBe(true);
  expect(fixMatches(">=", "")).toBe(false);
  expect(fixMatches("x", "   ")).toBe(false);
  expect(fixMatches("a  b", "a    b")).toBe(true);
});

// --- quizAnswerIsCorrect ---------------------------------------------------------

test("quizAnswerIsCorrect: correct index true, wrong index false", () => {
  const q = {
    question: "Which one?",
    options: ["<p>a</p>", "<p>b</p>", "<p>c</p>"],
    answer: 1,
  };
  expect(quizAnswerIsCorrect(q, 1)).toBe(true);
  expect(quizAnswerIsCorrect(q, 0)).toBe(false);
  expect(quizAnswerIsCorrect(q, 2)).toBe(false);
});

test("quizAnswerIsCorrect: out-of-range and non-integer indices are false, never throw", () => {
  const q = {
    question: "Which one?",
    options: ["<p>a</p>"],
    answer: 0,
  };
  expect(quizAnswerIsCorrect(q, 1)).toBe(false);
  expect(quizAnswerIsCorrect(q, -1)).toBe(false);
  expect(quizAnswerIsCorrect(q, 0.5)).toBe(false);
  expect(quizAnswerIsCorrect(q, Number.NaN)).toBe(false);
  expect(quizAnswerIsCorrect(q, Number.POSITIVE_INFINITY)).toBe(false);
});
