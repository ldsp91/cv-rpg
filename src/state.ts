/**
 * Shared progression state (spec #6, decision 12).
 *
 * Per-Location Challenge completion, the active dialogue, and the open
 * Challenge panel (quiz / coding) live in this one module, consumed by
 * BOTH halves of the UI split (ADR-0003): the Phaser scene (banner flip,
 * player freeze) and the React overlay (dialogue, challenges, character
 * sheet). No persistence in v1 (STACK.md) — the state is per page load.
 *
 * Seam: `createProgression(career)` is a pure factory over the career
 * file; the scene and the overlay share the singleton `progression`.
 */

import { career } from "./career";
import type { Career } from "./types";

/**
 * Immutable view of the progression. The whole snapshot object is
 * replaced on every change; between changes the SAME reference is
 * returned, so React's `useSyncExternalStore` sees a stable snapshot and
 * never re-renders for nothing.
 */
export interface ProgressionSnapshot {
  /** Location ids whose Challenge is complete. */
  readonly completed: ReadonlySet<string>;
  /** The open dialogue, or null. The scene freezes the player while set. */
  readonly dialogue: { locationId: string } | null;
  /**
   * The open Challenge panel (quiz / coding), or null. The scene freezes
   * the player while set — the overlay owns the interaction, exactly as
   * it does for the dialogue. A completed challenge does NOT close the
   * panel: the solved state (e.g. the in-place diff + explanation) stays
   * visible until the player closes it.
   */
  readonly challenge: { locationId: string } | null;
}

export interface Progression {
  readonly snapshot: ProgressionSnapshot;
  isComplete(locationId: string): boolean;
  /**
   * Mark a Location's Challenge complete. Idempotent: unknown ids and
   * already-complete ids are no-ops (the snapshot keeps its reference).
   */
  complete(locationId: string): void;
  /**
   * Open a Location's dialogue — the scene calls this on NPC proximity.
   * One dialogue at a time: a call while one is open is a no-op.
   */
  openDialogue(locationId: string): void;
  /** Close the open dialogue; a no-op when none is open. */
  closeDialogue(): void;
  /**
   * Open a Location's Challenge panel — the overlay calls this when the
   * Location's dialogue ends on a quiz / coding Location. One at a time:
   * a call while one is open is a no-op, as is a call for an unknown id
   * or for an already-complete Location (a replayed dialogue of a
   * finished Location must not re-open its solved panel).
   */
  openChallenge(locationId: string): void;
  /** Close the open Challenge panel; a no-op when none is open. */
  closeChallenge(): void;
  /** Subscribe to any change; returns the unsubscribe function. */
  subscribe(listener: () => void): () => void;
}

export function createProgression(career: Career): Progression {
  const locationIds = new Set(career.locations.map((l) => l.id));
  const completed = new Set<string>();
  let dialogue: { locationId: string } | null = null;
  let challenge: { locationId: string } | null = null;
  let snapshot: ProgressionSnapshot = { completed, dialogue, challenge };
  const listeners = new Set<() => void>();

  const commit = (): void => {
    // New Set + new snapshot object: consumers still holding the old one
    // keep seeing the old state.
    snapshot = { completed: new Set(completed), dialogue, challenge };
    for (const listener of [...listeners]) listener();
  };

  return {
    get snapshot() {
      return snapshot;
    },
    isComplete: (id) => completed.has(id),
    complete: (id) => {
      if (!locationIds.has(id) || completed.has(id)) return;
      completed.add(id);
      commit();
    },
    openDialogue: (id) => {
      if (!locationIds.has(id) || dialogue !== null) return;
      dialogue = { locationId: id };
      commit();
    },
    closeDialogue: () => {
      if (dialogue === null) return;
      dialogue = null;
      commit();
    },
    openChallenge: (id) => {
      // One panel at a time; and a finished Location keeps its solved
      // panel closed, even if its dialogue is replayed.
      if (!locationIds.has(id) || challenge !== null || completed.has(id))
        return;
      challenge = { locationId: id };
      commit();
    },
    closeChallenge: () => {
      if (challenge === null) return;
      challenge = null;
      commit();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** The shared instance: the game and the overlay both import this one. */
export const progression: Progression = createProgression(career);
