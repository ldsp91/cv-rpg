import "./resume.css";
import type { CV } from "../career.ts";

export interface ResumeProps {
  cv: CV;
  /**
   * Optional: renders a close button in the panel's corner. The host
   * passes it only on the landing screen, where the panel covers the
   * landing and no HUD exists to toggle it; in-game the HUD owns the
   * toggle and no button renders.
   */
  onClose?: () => void;
}

/**
 * The pure, presentational CV view: the traditional resume derived from
 * the career file — player header (name, headline, summary, links) plus
 * one experience entry per Location with period, skills, and evidence.
 *
 * Dumb by contract — data in via `cv` (the host passes
 * `deriveCV(career)`), so the view can never disagree with the file and
 * the gate/projects never leak in. No career reads. `onClose` is
 * optional: on the landing the panel covers the landing, so the host
 * passes a close affordance there; in-game the HUD toggles the panel.
 * Rendered in the panel slot by main.tsx; its own `@media print` rules
 * (resume.css) make it the whole page.
 */
export function Resume({ cv, onClose }: ResumeProps) {
  return (
    <div className="panel resume">
      {onClose && (
        <button className="panel-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      )}
      <header className="resume-header">
        <h2 className="resume-name">{cv.name}</h2>
        <p className="resume-headline">{cv.headline}</p>
        <div
          className="resume-summary"
          dangerouslySetInnerHTML={{ __html: cv.summary }}
        />
        {cv.links.length > 0 && (
          <div className="resume-links">
            {cv.links.map((link, i) => (
              <a
                key={i}
                className="resume-link"
                href={link.url}
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </header>
      <section className="resume-experience">
        <h3 className="resume-section-title">Experience</h3>
        <div className="resume-entries">
          {cv.experience.map((entry, i) => (
            <div className="resume-entry" key={i}>
              <div className="resume-entry-head">
                <span className="resume-entry-title">{entry.title}</span>
                <span className="resume-entry-period">{entry.period}</span>
              </div>
              <ul className="resume-skills">
                {entry.skills.map((skill, j) => (
                  <li className="resume-skill" key={j}>
                    <em className="resume-skill-name">{skill.name}</em>{" "}
                    <span
                      className="resume-skill-evidence"
                      dangerouslySetInnerHTML={{ __html: skill.evidence }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
