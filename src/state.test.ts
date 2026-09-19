/**
 * Tests for the shared progression state (`src/state.ts`).
 *
 * Seam: the public `createProgression(career)` factory (a pure function
 * over the career file — spec #6's testing decision) and its interface:
 * snapshot / isComplete / complete / openDialogue / closeDialogue /
 * subscribe. The scene (banner flip, player freeze) and the React
 * overlay (dialogue, sheet) both consume it through this same interface.
 */
import { test, expect } from "bun:test";
import career from "../data/career.jsonc";
import { createProgression } from "./state";

const allIds = career.locations.map((l) => l.id);

// --- fresh state -------------------------------------------------------------

test("fresh progression: nothing complete, no dialogue", () => {
  const p = createProgression(career);
  expect([...p.snapshot.completed]).toEqual([]);
  expect(p.snapshot.dialogue).toBeNull();
  for (const id of allIds) {
    expect(p.isComplete(id)).toBe(false);
  }
});

// --- complete ------------------------------------------------------------------

test("complete: marks the Location, is idempotent", () => {
  const p = createProgression(career);
  p.complete("school");
  expect(p.isComplete("school")).toBe(true);
  expect(p.snapshot.completed.has("school")).toBe(true);
  expect([...p.snapshot.completed]).toEqual(["school"]);
  p.complete("school"); // completing twice does not duplicate
  expect([...p.snapshot.completed]).toEqual(["school"]);
});

test("complete: multiple Locations accumulate", () => {
  const p = createProgression(career);
  p.complete("school");
  p.complete("current-role");
  expect(p.isComplete("school")).toBe(true);
  expect(p.isComplete("current-role")).toBe(true);
  expect(p.isComplete("university")).toBe(false);
  expect([...p.snapshot.completed].sort()).toEqual(["current-role", "school"]);
});

test("complete: an unknown id is a no-op (snapshot keeps its reference)", () => {
  const p = createProgression(career);
  const before = p.snapshot;
  p.complete("a-ghost-location");
  expect([...p.snapshot.completed]).toEqual([]);
  expect(p.snapshot).toBe(before);
});

// --- dialogue ------------------------------------------------------------------

test("openDialogue: one at a time; closeDialogue clears", () => {
  const p = createProgression(career);
  p.openDialogue("university");
  expect(p.snapshot.dialogue).toEqual({ locationId: "university" });
  // A second open while one is open is a no-op (the first wins).
  p.openDialogue("school");
  expect(p.snapshot.dialogue).toEqual({ locationId: "university" });
  p.closeDialogue();
  expect(p.snapshot.dialogue).toBeNull();
  // And it can be opened again afterwards.
  p.openDialogue("school");
  expect(p.snapshot.dialogue).toEqual({ locationId: "school" });
});

test("dialogue: unknown id is a no-op; close with nothing open is a no-op", () => {
  const p = createProgression(career);
  const before = p.snapshot;
  p.openDialogue("ghost");
  expect(p.snapshot).toBe(before);
  p.closeDialogue();
  expect(p.snapshot).toBe(before);
  expect(p.snapshot.dialogue).toBeNull();
});

// --- challenge ------------------------------------------------------------------

test("challenge: openChallenge sets the Location; one at a time", () => {
  const p = createProgression(career);
  p.openChallenge("university");
  expect(p.snapshot.challenge).toEqual({ locationId: "university" });
  // A second open while one is open is a no-op (the first wins).
  p.openChallenge("current-role");
  expect(p.snapshot.challenge).toEqual({ locationId: "university" });
  p.closeChallenge();
  expect(p.snapshot.challenge).toBeNull();
  // And it can be opened again afterwards.
  p.openChallenge("current-role");
  expect(p.snapshot.challenge).toEqual({ locationId: "current-role" });
});

test("challenge: unknown id is a no-op; close with nothing open is a no-op", () => {
  const p = createProgression(career);
  const before = p.snapshot;
  p.openChallenge("ghost");
  expect(p.snapshot).toBe(before);
  p.closeChallenge();
  expect(p.snapshot).toBe(before);
  expect(p.snapshot.challenge).toBeNull();
});

test("challenge: openChallenge is a no-op for an already-complete Location", () => {
  const p = createProgression(career);
  p.complete("university");
  const before = p.snapshot;
  p.openChallenge("university");
  expect(p.snapshot).toBe(before);
  expect(p.snapshot.challenge).toBeNull();
  // An uncompleted Location still opens.
  p.openChallenge("current-role");
  expect(p.snapshot.challenge).toEqual({ locationId: "current-role" });
});

test("challenge: completing does NOT close the open challenge (the solved panel stays)", () => {
  const p = createProgression(career);
  p.openChallenge("university");
  p.complete("university");
  // The banner flips and the sheet reveals via `completed`, but the panel
  // keeps showing its solved state until the player closes it.
  expect(p.isComplete("university")).toBe(true);
  expect(p.snapshot.challenge).toEqual({ locationId: "university" });
  p.closeChallenge();
  expect(p.snapshot.challenge).toBeNull();
});

// --- subscribe / snapshot stability --------------------------------------------

test("subscribe: fires once per change, reads do not fire", () => {
  const p = createProgression(career);
  let calls = 0;
  const unsub = p.subscribe(() => calls++);

  p.snapshot; // reading the snapshot is not a change
  expect(calls).toBe(0);

  p.complete("school");
  p.complete("university");
  expect(calls).toBe(2);

  p.complete("school"); // idempotent: no new change
  expect(calls).toBe(2);

  unsub();
  p.complete("first-job");
  expect(calls).toBe(2); // unsubscribed listeners never fire again
});

test("snapshot: stable reference between changes, new reference after", () => {
  const p = createProgression(career);
  const s1 = p.snapshot;
  expect(p.snapshot).toBe(s1); // repeated reads, same reference
  p.complete("school");
  expect(p.snapshot).not.toBe(s1);
  const s2 = p.snapshot;
  expect(p.snapshot).toBe(s2);
  p.openDialogue("school");
  expect(p.snapshot).not.toBe(s2);
  p.closeDialogue();
  expect(p.snapshot.dialogue).toBeNull();
});
