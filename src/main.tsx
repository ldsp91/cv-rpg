import { createRoot } from "react-dom/client";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Phaser from "phaser";
import { CityScene } from "./city";
import { progression } from "./state";
import { career, unlockedSkills } from "./career";
import { Dialogue } from "./ui/dialogue";
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

  const dialogueLocation = snap.dialogue
    ? (career.locations.find((loc) => loc.id === snap.dialogue!.locationId) ??
      null)
    : null;

  // A newly opened dialogue always starts at the first line.
  useEffect(() => {
    if (dialogueLocation) setLine(0);
  }, [dialogueLocation?.id]);

  const advance = useCallback(() => {
    if (!dialogueLocation) return;
    if (line < dialogueLocation.dialogue.length - 1) {
      setLine(line + 1);
    } else {
      // A talk Challenge IS its dialogue: finishing the dialogue completes
      // the Location. Quiz/coding Locations must NOT complete here — their
      // solve sequence is issue #10, and closing their dialogue without
      // complete() is the intended hand-off.
      if (dialogueLocation.challenge.type === "talk") {
        progression.complete(dialogueLocation.id);
      }
      progression.closeDialogue();
    }
  }, [line, dialogueLocation]);

  // Enter advances the dialogue — only while one is open, so issue #10's
  // challenge inputs (e.g. a coding-puzzle <input>) can never advance it.
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
