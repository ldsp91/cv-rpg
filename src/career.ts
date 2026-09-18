/**
 * Pure derivation logic over the career file.
 *
 * Every function takes its data as a parameter — none of them reads the
 * imported file internally, so the module is trivially testable and
 * reusable. The file itself is re-exported, typed as `Career` by
 * `data/career.jsonc.d.ts`, for the later game/UI steps.
 */

import career from "../data/career.jsonc";
import type { Career, Link, QuizQuestion, Skill } from "./types";

export { career };

export interface CVEntry {
  title: string;
  period: string;
  skills: Skill[];
}

export interface CV {
  name: string;
  headline: string;
  summary: string;
  links: Link[];
  experience: CVEntry[];
}

/**
 * Derive the CV from the file: the player's fields as-is, plus one
 * experience entry per Location in file (timeline) order. The gate and
 * projects are never read — they must not leak into the CV.
 */
export function deriveCV(career: Career): CV {
  return {
    name: career.player.name,
    headline: career.player.headline,
    summary: career.player.summary,
    links: career.player.links,
    experience: career.locations.map((location) => ({
      title: location.title,
      period: location.period,
      skills: location.skills,
    })),
  };
}

/**
 * Location ids in map order. Timeline order IS map order — the owner
 * never writes coordinates, the array order places them.
 */
export function layoutOrder(career: Career): string[] {
  return career.locations.map((location) => location.id);
}

/**
 * The gate opens only when every Location's challenge is complete —
 * i.e. every location id appears in `completedIds`. Zero locations
 * means the gate is open (vacuously every challenge is done).
 */
export function isGateOpen(
  career: Career,
  completedIds: ReadonlySet<string>,
): boolean {
  return career.locations.every((location) => completedIds.has(location.id));
}

/** One aggregated skill, tagged with the Location that unlocked it. */
export interface UnlockedSkill {
  skill: Skill;
  locationId: string;
  locationTitle: string;
  period: string;
}

/**
 * Every skill of every Location, in location order then skill order,
 * tagged with its Location. A skill name appearing at two Locations
 * yields TWO entries — no merging or deduping.
 */
export function aggregateSkills(career: Career): UnlockedSkill[] {
  return career.locations.flatMap((location) =>
    location.skills.map((skill) => ({
      skill,
      locationId: location.id,
      locationTitle: location.title,
      period: location.period,
    })),
  );
}

/**
 * The skills of the COMPLETED Locations — what the character sheet
 * reveals. Same tagging and order as `aggregateSkills`, filtered to the
 * completed ids; a skill name at two completed Locations stays TWO
 * entries, each tagged with its Location.
 */
export function unlockedSkills(
  career: Career,
  completedIds: ReadonlySet<string>,
): UnlockedSkill[] {
  return aggregateSkills(career).filter((entry) =>
    completedIds.has(entry.locationId),
  );
}

/** ADR-0005 lenient matching: trim the ends, collapse inner whitespace
 *  runs to single spaces, then compare case-SENSITIVELY. */
function normalizeForFix(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

export function fixMatches(fix: string, typed: string): boolean {
  return normalizeForFix(fix) === normalizeForFix(typed);
}

/**
 * `chosenIndex === question.answer` — and false, never an exception, for
 * out-of-range, negative, or non-integer indices (`===` already rejects
 * those, so no coercion is applied).
 */
export function quizAnswerIsCorrect(
  question: QuizQuestion,
  chosenIndex: number,
): boolean {
  return chosenIndex === question.answer;
}
