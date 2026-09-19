import { createRoot } from "react-dom/client";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Phaser from "phaser";
import { CityScene } from "./city";
import { progression } from "./state";
import { advanceDialogue, career, deriveCV, isGateOpen, unlockedSkills } from "./career";
import { Capstone } from "./ui/capstone";
import { Landing } from "./ui/landing";
import { ProjectsView } from "./ui/projects";
import { Resume } from "./ui/resume";
import { gameLaunched, launchGame } from "./launch";
import { Dialogue } from "./ui/dialogue";
import { Quiz } from "./ui/quiz";
import { Coding } from "./ui/coding";
import { Sheet } from "./ui/sheet";
import { Hud, type View } from "./ui/hud";

// Entry point. The app is split in two (ADR-0003):
// - Phaser owns the game world, booted once into the stable #game container.
// - React owns the DOM overlay in #ui (landing screen, persistent HUD,
//   dialogue, sheet, and the CV/projects panel slot).
// React must never re-create the element Phaser has mounted into.

class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  override update() {
    // Hand off to the game world only once the player presses "Play
    // Experience" (React flips the launch flag). Before that the City scene
    // is never started — no world, no movement, no proximity dialogue.
    if (gameLaunched() && !this.scene.isActive("City")) {
      this.scene.stop();
      this.scene.start("City");
    }
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
  // "landing" until "Play Experience" boots the world; the HUD is the
  // in-game bar, so it renders only in "game" — on the landing the three
  // landing buttons are the actions.
  const [screen, setScreen] = useState<"landing" | "game">("landing");
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
      // On the landing the panel covers the landing and no HUD exists,
      // so the view gets a close affordance; in-game the HUD toggles it.
      <Resume
        cv={deriveCV(career)}
        onClose={screen === "landing" ? () => setView("none") : undefined}
      />
    ) : view === "projects" ? (
      <ProjectsView
        projects={career.projects}
        onClose={screen === "landing" ? () => setView("none") : undefined}
      />
    ) : null;

  return (
    <>
      {screen === "landing" ? (
        <Landing
          world={career.world}
          player={career.player}
          onPlay={() => {
            setScreen("game");
            launchGame();
          }}
          onResume={() => setView("resume")}
          onProjects={() => setView("projects")}
        />
      ) : (
        <Hud view={view} onToggle={onToggle} />
      )}
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

const ui = document.getElementById("ui");
if (ui) {
  createRoot(ui).render(<App />);
}
