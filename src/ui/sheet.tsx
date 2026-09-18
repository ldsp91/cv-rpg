import "./sheet.css";
import type { UnlockedSkill } from "../career.ts";

export interface SheetProps {
  entries: UnlockedSkill[];
  onClose: () => void;
}

/**
 * The pure, presentational character sheet: one row per unlocked skill,
 * tagged with the Location that unlocked it, with the skill's HTML
 * evidence rendered inline.
 *
 * Dumb by contract — data in via `entries`, action out via `onClose`.
 * No career reads, no progression, no filtering (the host computes the
 * entries for the completed Locations). A skill name appearing at two
 * Locations arrives as two entries and is rendered as two rows — never
 * grouped, merged, or deduped here.
 */
export function Sheet({ entries, onClose }: SheetProps) {
  return (
    <div className="sheet-overlay">
      <div className="sheet" role="dialog" aria-label="Character Sheet">
        <div className="sheet-header">
          <h2 className="sheet-title">Character Sheet</h2>
          <button className="sheet-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        {entries.length === 0 ? (
          <p className="sheet-empty">
            Nothing unlocked yet — complete a Location's challenge to reveal
            its skills.
          </p>
        ) : (
          <div className="sheet-rows">
            {entries.map((entry, i) => (
              <div className="sheet-row" key={`${entry.locationId}-${i}`}>
                <div className="sheet-row-head">
                  <span className="sheet-skill">{entry.skill.name}</span>
                  <span className="sheet-location">
                    {entry.locationTitle} · {entry.period}
                  </span>
                </div>
                <div
                  className="sheet-evidence"
                  dangerouslySetInnerHTML={{ __html: entry.skill.evidence }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
