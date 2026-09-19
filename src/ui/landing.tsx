import "./landing.css";
import type { Player, World } from "../types";

export interface LandingProps {
  /** Optional — the file schema allows a career without world framing. */
  world?: World;
  player: Player;
  onPlay: () => void;
  onResume: () => void;
  onProjects: () => void;
}

/**
 * The pure, presentational landing screen: the first thing a visitor sees.
 * When `world` is present it frames the world (name + blurb), then shows
 * the player's name, headline, summary, and links, and exactly three
 * actions — Play Experience, View Resume, View Projects.
 *
 * Dumb by contract — data in via props, actions out via callbacks, no
 * career/progression imports. The host (main.tsx) passes `career.world`
 * and `career.player` and owns the launch/panel side effects.
 */
export function Landing({
  world,
  player,
  onPlay,
  onResume,
  onProjects,
}: LandingProps) {
  return (
    <div className="landing">
      <div className="landing-inner">
        {world && (
          <div className="landing-world">
            <h1 className="landing-world-name">{world.name}</h1>
            <div
              className="landing-world-blurb"
              dangerouslySetInnerHTML={{ __html: world.blurb }}
            />
          </div>
        )}
        <div className="landing-player">
          <h2 className="landing-player-name">{player.name}</h2>
          <p className="landing-player-headline">{player.headline}</p>
          <div
            className="landing-player-summary"
            dangerouslySetInnerHTML={{ __html: player.summary }}
          />
          {player.links.length > 0 && (
            <div className="landing-links">
              {player.links.map((link, i) => (
                <a
                  key={i}
                  className="landing-link"
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="landing-actions">
          <button className="landing-button" onClick={onPlay}>
            Play Experience
          </button>
          <button className="landing-button" onClick={onResume}>
            View Resume
          </button>
          <button className="landing-button" onClick={onProjects}>
            View Projects
          </button>
        </div>
      </div>
    </div>
  );
}
