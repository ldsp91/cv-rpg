import "./capstone.css";
import type { Gate } from "../types";

export interface CapstoneProps {
  gate: Gate;
}

/**
 * The persistent capstone display, shown once the final gate opens:
 * the exact 'Journey complete' mark, the gate's title, and the gate's
 * html message.
 *
 * Dumb by contract — data in via `gate`, no career or progression reads
 * (the host renders it only when `isGateOpen` is true, so the closed
 * state is the absence of this component: nothing about the gate shows
 * while it is closed).
 *
 * Persistent and NON-dismissible by design — no close button, no
 * click-away, `pointer-events: none` (see capstone.css). It is a compact
 * banner, not a full-screen modal: the city and the HUD stay visible
 * and usable beneath/around it for the rest of the session.
 */
export function Capstone({ gate }: CapstoneProps) {
  return (
    <div className="capstone" role="status" aria-label="Journey complete">
      <div className="capstone-head">
        <span className="capstone-mark">Journey complete</span>
        <span className="capstone-title">{gate.title}</span>
      </div>
      <div
        className="capstone-html"
        dangerouslySetInnerHTML={{ __html: gate.html }}
      />
    </div>
  );
}
