import { test, expect } from "bun:test";
import career from "./data/career.jsonc";

// Smoke test: the career file parses through Bun's jsonc loader and carries
// the settled placeholder content. Deep shape validation lives in
// `src/validate.ts` (`bun run check`); derivation logic in `src/career.ts`.

test("the career file is a valid content source", () => {
  expect(typeof career.player.name).toBe("string");
  expect(career.player.name.length).toBeGreaterThan(0);
  expect(typeof career.player.headline).toBe("string");
  expect(typeof career.player.summary).toBe("string");
  expect(Array.isArray(career.player.links)).toBe(true);

  expect(career.world?.name).toBe("Tech City");

  // The four placeholder Locations, in career timeline order.
  expect(career.locations.map((l) => l.id)).toEqual([
    "school",
    "university",
    "first-job",
    "current-role",
  ]);

  for (const location of career.locations) {
    expect(location.title.length).toBeGreaterThan(0);
    expect(location.period.length).toBeGreaterThan(0);
    expect(location.dialogue.length).toBeGreaterThan(0);
    expect(["talk", "quiz", "coding"]).toContain(location.challenge.type);
    expect(location.skills.length).toBeGreaterThan(0);
  }

  // Exactly one coding challenge, hosted at current-role, with exactly one
  // blank and a non-empty fix.
  const coding = career.locations.filter(
    (l) => l.challenge.type === "coding",
  );
  expect(coding.length).toBe(1);
  expect(coding[0]!.id).toBe("current-role");
  const codingChallenge = coding[0]!.challenge;
  if (codingChallenge.type === "coding") {
    expect(codingChallenge.code.split("____").length - 1).toBe(1);
    expect(codingChallenge.fix.length).toBeGreaterThan(0);
  }

  expect(Array.isArray(career.projects)).toBe(true);
  expect(career.projects.length).toBeGreaterThan(0);
  expect(career.gate.title.length).toBeGreaterThan(0);
  expect(career.gate.html.length).toBeGreaterThan(0);
});
