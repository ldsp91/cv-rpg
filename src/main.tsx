import { createRoot } from "react-dom/client";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Phaser from "phaser";
import { CityScene } from "./city";
import { progression } from "./state";
import { advanceDialogue, career, isGateOpen, unlockedSkills } from "./career";
import { Capstone } from "./ui/capstone";
import { Dialogue } from "./ui/dialogue";
import { Quiz } from "./ui/quiz";
import { Coding } from "./ui/coding";
import { Sheet } from "./ui/sheet";
import { Hud, type View } from "./ui/hud";

// Entry point. The app is split in two (ADR-0003):
// - Phaser owns the game world, booted once into the stable #game container.
// - React owns the DOM overlay in #ui (persistent HUD, dialogue, sheet, and
//   the Resume/Projects placeholders that issue #11 will fill with the real
//   CV and projects views).
// React must never re-create the element Phaser has mounted into.

class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  create() {
    // Hand off to the game world. The scene list's first scene (Boot) is the
    // only one that auto-starts.
    this.scene.start("City");
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: 320,
  height: 240,
  backgroundColor: "#101018",
  pixelArt: true,
  physics: { default: "arcade", arcade: { debug: false } },
  scene: [BootScene, CityScene],
});

/**
 * The React overlay: the persistent HUD plus the panel slot (sheet / resume
 * / projects) and the dialogue strip. All game-facing state comes from the
 * shared `progression` singleton via `useSyncExternalStore`, so dialogue,
 * completions, and the sheet reveal all update without any game/React bridge.
 */
function App() {
  const snap = useSyncExternalStore(
    progression.subscribe,
    () => progression.snapshot,
  );
  const [view, setView] = useState<View | "none">("none");
  // 0-based index of the line revealed so far in the open dialogue.
  const [line, setLine] = useState(0);
  // The final gate: open only when every Location's Challenge is complete
  // (derived, spec decision 12 — no state). While closed, nothing about
  // the gate renders anywhere; open, the persistent capstone shows it.
  const gateOpen = isGateOpen(career, snap.completed);

  const dialogueLocation = snap.dialogue
    ? (career.locations.find((loc) => loc.id === snap.dialogue!.locationId) ??
      null)
    : null;

  const challengeLocation = snap.challenge
    ? career.locations.find((loc) => loc.id === snap.challenge!.locationId) ??
      null
    : null;

  // A newly opened dialogue always starts at the first line.
  useEffect(() => {
    if (dialogueLocation) setLine(0);
  }, [dialogueLocation?.id]);

  const advance = useCallback(() => {
    if (!dialogueLocation) return;
    const step = advanceDialogue(dialogueLocation, line);
    if (step.kind === "reveal") {
      setLine(step.nextLine);
    } else {
      // A talk Challenge IS its dialogue: finishing the dialogue completes
      // the Location. Quiz/coding Locations must NOT complete here — their
      // solve sequence starts when the panel opens (see advanceDialogue).
      if (step.completeLocation) {
        progression.complete(dialogueLocation.id);
      } else {
        // Hand off to the Challenge panel. openChallenge no-ops for
        // unknown ids, a panel already open, and already-complete
        // Locations, so replaying a finished Location's dialogue never
        // re-opens its solved panel.
        progression.openChallenge(dialogueLocation.id);
      }
      progression.closeDialogue();
    }
  }, [line, dialogueLocation]);

  // Enter advances the dialogue — only while one is open, so the
  // challenge inputs (e.g. the coding-puzzle <input>) can never advance it.
  useEffect(() => {
    if (!dialogueLocation) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") advance();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialogueLocation, advance]);

  const onToggle = (next: View) =>
    setView((current) => (current === next ? "none" : next));

  // One panel slot: issue #11 swaps the placeholders for the real views,
  // not this wiring. The snapshot is reactive, so the sheet re-renders when
  // a Location completes — that re-render IS the "watch the skills land"
  // reveal.
  const panel =
    view === "sheet" ? (
      <Sheet
        entries={unlockedSkills(career, snap.completed)}
        onClose={() => setView("none")}
      />
    ) : view === "resume" ? (
      <PlaceholderPanel title="Resume" text="The full CV view lands in issue #11." />
    ) : view === "projects" ? (
      <PlaceholderPanel title="Projects" text="The projects view lands in issue #11." />
    ) : null;

  return (
    <>
      <Hud view={view} onToggle={onToggle} />
      {panel}
      {gateOpen && <Capstone gate={career.gate} />}
      {dialogueLocation && (
        <Dialogue
          locationId={dialogueLocation.id}
          npcName={dialogueLocation.npcName ?? ""}
          locationTitle={dialogueLocation.title}
          lines={dialogueLocation.dialogue}
          visibleCount={line + 1}
          onAdvance={advance}
        />
      )}
      {challengeLocation?.challenge.type === "quiz" && (
        <Quiz
          questions={challengeLocation.challenge.questions}
          onSolved={() => progression.complete(challengeLocation.id)}
          onDone={() => progression.closeChallenge()}
        />
      )}
      {challengeLocation?.challenge.type === "coding" && (
        <Coding
          challenge={challengeLocation.challenge}
          onSolved={() => progression.complete(challengeLocation.id)}
          onDone={() => progression.closeChallenge()}
        />
      )}
    </>
  );
}

/** Minimal placeholder for the views issue #11 will build. */
function PlaceholderPanel({ title, text }: { title: string; text: string }) {
  return (
    <div className="panel">
      <h2 className="panel-title">{title}</h2>
      <p>{text}</p>
    </div>
  );
}

const ui = document.getElementById("ui");
if (ui) {
  createRoot(ui).render(<App />);
}
