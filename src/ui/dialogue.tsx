import "./dialogue.css";

export interface DialogueProps {
  locationId: string;
  npcName: string;
  locationTitle: string;
  lines: string[];
  visibleCount: number;
  onAdvance: () => void;
}

/**
 * The pure, presentational dialogue overlay: the NPC nameplate and the
 * ordered speech bubbles revealed so far, with the advance affordance.
 *
 * Dumb by contract — all data in via props, all action out via
 * `onAdvance`. No progression, no career reads, no keyboard handling
 * (the host owns the Enter listener).
 */
export function Dialogue(props: DialogueProps) {
  const { npcName, locationTitle, lines, visibleCount, onAdvance } = props;

  // Ordered, accumulating: earlier bubbles stay as later ones are revealed.
  const visibleLines = lines.slice(0, visibleCount);
  const isLast = visibleCount === lines.length;
  const hint = isLast
    ? "Enter or click to finish"
    : "Enter or click to continue";

  return (
    <div className="dialogue" onClick={onAdvance}>
      <div className="dialogue-nameplate">{npcName || locationTitle}</div>
      <div className="dialogue-bubbles">
        {visibleLines.map((line, i) => (
          <div
            key={i}
            className="dialogue-bubble"
            dangerouslySetInnerHTML={{ __html: line }}
          />
        ))}
      </div>
      <div className="dialogue-hint">{hint}</div>
    </div>
  );
}
