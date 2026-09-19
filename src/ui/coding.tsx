import "./coding.css";
import { useRef, useState } from "react";
import type { CodingChallenge } from "../types";
import { fixMatches } from "../career";

export interface CodingProps {
  challenge: CodingChallenge;
  /** Host: progression.complete(locationId) — skills reveal + banner flip. */
  onSolved: () => void;
  /** Host: progression.closeChallenge() — called from the Done button. */
  onDone: () => void;
}

type Feedback =
  | { tone: "nudge"; text: string }
  | { tone: "reject"; text: string };

/**
 * The presentational coding puzzle: the fill-in-the-blank snippet (ADR-0005),
 * gentle rejection on wrong entries, and the coding half of the shared solve
 * sequence — the broken line struck in place, the fix inserted as a "+" line,
 * the explanation rendered, then Done.
 *
 * Dumb by contract — data in via `challenge`, action out via `onSolved`
 * (called exactly once, at the moment of a correct entry) and `onDone`.
 * No progression, no career reads, no state imports.
 */
export function Coding(props: CodingProps) {
  const { challenge, onSolved, onDone } = props;
  const [value, setValue] = useState("");
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const lines = challenge.code.split("\n");

  function submit() {
    if (solved) return;
    if (!value.trim()) {
      setFeedback({ tone: "nudge", text: "Type the missing piece first." });
      return;
    }
    if (fixMatches(challenge.fix, value)) {
      // The shared solve sequence: diff in place + explanation, and the
      // host flips the banner / reveals the skills at this instant.
      setSolved(true);
      setFeedback(null);
      onSolved();
    } else {
      // Gentle rejection: no locking, no clearing, unlimited retries.
      setFeedback({ tone: "reject", text: "Not quite — try again." });
      inputRef.current?.select();
    }
  }

  return (
    <div className="coding">
      <div
        className="coding-context"
        dangerouslySetInnerHTML={{ __html: challenge.context }}
      />
      <div className="coding-snippet">
        {lines.map((line, i) => {
          const parts = line.split("____");
          const isBlank = parts.length === 2;
          const before = parts[0] ?? "";
          const after = parts[1] ?? "";

          if (isBlank && solved) {
            // In-place diff: the struck line (blank shown literally) plus the
            // "+" line with the fix, indentation preserved.
            return (
              <div key={i}>
                <div className="coding-line coding-struck">
                  <span className="coding-linenum">{i + 1}</span>
                  <span className="coding-linecode">
                    <del>{before}____{after}</del>
                  </span>
                </div>
                <div className="coding-line coding-plus">
                  <span className="coding-linenum">+</span>
                  <span className="coding-linecode">
                    {before}
                    <ins>{challenge.fix}</ins>
                    {after}
                  </span>
                </div>
              </div>
            );
          }

          return (
            <div className="coding-line" key={i}>
              <span className="coding-linenum">{i + 1}</span>
              <span className="coding-linecode">
                {before}
                {isBlank && (
                  <input
                    ref={inputRef}
                    className="coding-input"
                    value={value}
                    disabled={solved}
                    spellCheck={false}
                    autoComplete="off"
                    placeholder="…?"
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        submit();
                      }
                    }}
                  />
                )}
                {after}
              </span>
            </div>
          );
        })}
      </div>

      {!solved && (
        <>
          {feedback && (
            <div className={`coding-feedback coding-feedback-${feedback.tone}`}>
              {feedback.text}
            </div>
          )}
          <div className="coding-actions">
            <button className="coding-check" onClick={submit}>
              Check
            </button>
          </div>
        </>
      )}

      {solved && (
        <>
          <div
            className="coding-explanation"
            dangerouslySetInnerHTML={{ __html: challenge.explanation }}
          />
          <div className="coding-solved">
            <div className="coding-unlocked">unlocked</div>
            <button className="coding-done" onClick={onDone}>
              Done
            </button>
          </div>
        </>
      )}
    </div>
  );
}
