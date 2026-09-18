import "./hud.css";

/** The views the persistent HUD can open (see main.tsx). */
export type View = "sheet" | "resume" | "projects";

export interface HudProps {
  /** The open view, or "none" — the active button is highlighted. */
  view: View | "none";
  /** One click per button; the host toggles (same button closes). */
  onToggle: (view: View) => void;
}

/**
 * The persistent HUD bar: always visible in-game, exactly three buttons —
 * Sheet, Resume, Projects — so the CV is one click away at all times
 * (issue #9, AC 5). Presentational: the host owns the view state.
 */
export function Hud({ view, onToggle }: HudProps) {
  const buttons: { id: View; label: string }[] = [
    { id: "sheet", label: "Sheet" },
    { id: "resume", label: "Resume" },
    { id: "projects", label: "Projects" },
  ];

  return (
    <div className="hud" role="toolbar" aria-label="Game menus">
      {buttons.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className={`hud-btn${view === id ? " hud-btn-active" : ""}`}
          aria-pressed={view === id}
          onClick={() => onToggle(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
