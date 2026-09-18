/**
 * The settled Career file schema — the single content source.
 *
 * The data lives in `data/career.jsonc`; its inline comments are the filling
 * manual (see that file for the owner-facing documentation of every field).
 * This module only types the shape — no logic. The pure derivation logic over
 * this shape lives in `src/career.ts`; the validator rules in `src/validate.ts`.
 *
 * Shape settled on map ticket #2 ("Career file: what the JSON must express")
 * and spec #6 (Tech City v1). Text fields are HTML by convention; plain
 * strings (ids, titles, periods, code, fixes) are rendered verbatim or used
 * as data, never parsed.
 */

/** A labelled link, e.g. { "label": "GitHub", "url": "https://…" }. */
export interface Link {
  label: string;
  url: string;
}

/** The owner — rendered on the landing and derived into the CV. */
export interface Player {
  name: string;
  headline: string;
  /** HTML — CV + landing. */
  summary: string;
  links: Link[];
}

/** The themed umbrella over the whole career map (v1: Tech City). Optional. */
export interface World {
  name: string;
  /** HTML. */
  blurb: string;
}

/** A real skill revealed by completing a Location's Challenge. */
export interface Skill {
  name: string;
  /** HTML — the evidence (years, projects, usage). */
  evidence: string;
}

/** Zero payload — finishing the Location's dialogue unlocks it. */
export interface TalkChallenge {
  type: "talk";
}

/** One quiz question. `answer` is the index of the correct option. */
export interface QuizQuestion {
  /** HTML. */
  question: string;
  /** Non-empty list of HTML options. */
  options: string[];
  /** Index into `options` of the correct answer. */
  answer: number;
  /** Optional HTML — gentle feedback shown after answering. */
  note?: string;
}

/** One or more questions; each is answered in order. */
export interface QuizChallenge {
  type: "quiz";
  questions: QuizQuestion[];
}

/**
 * The fill-in-the-blank coding puzzle (ADR-0005). `code` is the broken
 * snippet with exactly one `____` placeholder; `fix` is the accepted token.
 */
export interface CodingChallenge {
  type: "coding";
  /** HTML — the story of what broke. */
  context: string;
  /** Plain string — the broken snippet, with exactly one `____`. */
  code: string;
  /** Plain string — the accepted fix (non-empty). */
  fix: string;
  /** HTML — why the fix works, rendered after solving. */
  explanation: string;
}

/** Exactly one Challenge per Location. */
export type Challenge = TalkChallenge | QuizChallenge | CodingChallenge;

/** One career milestone on the map. `id` is a unique owner-written kebab slug. */
export interface Location {
  id: string;
  /** The real name — shared with the CV. */
  title: string;
  /** Free-form display string, rendered verbatim (never parsed). */
  period: string;
  /** Optional — the NPC nameplate. */
  npcName?: string;
  /** Ordered HTML lines — one speech bubble each, no branching. */
  dialogue: string[];
  challenge: Challenge;
  skills: Skill[];
}

/** One entry of the career-wide portfolio list. */
export interface Project {
  name: string;
  /** HTML. */
  html: string;
  links: Link[];
}

/** The final gate — the capstone at the far end of the map. Top-level,
 *  never a Location: it must not leak into the derived CV. */
export interface Gate {
  title: string;
  /** HTML. */
  html: string;
}

/** The root shape of `data/career.jsonc`. */
export interface Career {
  player: Player;
  world?: World;
  locations: Location[];
  projects: Project[];
  gate: Gate;
}
