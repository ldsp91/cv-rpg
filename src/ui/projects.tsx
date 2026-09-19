import "./projects.css";
import type { Project } from "../types";

export interface ProjectsProps {
  projects: Project[];
}

/**
 * The pure, presentational projects view: the career-wide portfolio list,
 * one entry per project in file order — name, HTML body, and its links.
 *
 * Dumb by contract — data in via `projects`, no career reads (the host
 * passes `career.projects` from the file, so the view can never disagree
 * with it). Rendered inside the panel slot by main.tsx.
 */
export function ProjectsView({ projects }: ProjectsProps) {
  return (
    <div className="panel projects">
      <h2 className="panel-title">Projects</h2>
      {projects.length === 0 ? (
        <p className="projects-empty">No projects listed yet.</p>
      ) : (
        <div className="projects-list">
          {projects.map((project) => (
            <div className="project" key={project.name}>
              <h3 className="project-name">{project.name}</h3>
              <div
                className="project-html"
                dangerouslySetInnerHTML={{ __html: project.html }}
              />
              {project.links.length > 0 && (
                <div className="project-links">
                  {project.links.map((link, i) => (
                    <a
                      key={i}
                      className="project-link"
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
          ))}
        </div>
      )}
    </div>
  );
}
