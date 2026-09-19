import { test, expect } from "bun:test";
import { renderToString } from "react-dom/server";
import career from "../../data/career.jsonc";
import type { Project } from "../types";
import { ProjectsView } from "./projects.tsx";

// --- helpers -----------------------------------------------------------------

function syntheticProject(
  overrides: Partial<Project> & { name: string },
): Project {
  return {
    html: "<p>What it is.</p>",
    links: [],
    ...overrides,
  };
}

// --- list ----------------------------------------------------------------------

test("renders one entry per project, in the order given, with the name", () => {
  const projects = [
    syntheticProject({ name: "Alpha" }),
    syntheticProject({ name: "Beta" }),
  ];
  const html = renderToString(<ProjectsView projects={projects} />);

  const names = html.match(/<h3 class="project-name">[^<]+<\/h3>/g) ?? [];
  expect(names).toEqual([
    '<h3 class="project-name">Alpha</h3>',
    '<h3 class="project-name">Beta</h3>',
  ]);
});

test("renders each project's HTML body", () => {
  const html = renderToString(
    <ProjectsView
      projects={[syntheticProject({ name: "A", html: "<p>The <em>body</em>.</p>" })]}
    />,
  );
  expect(html).toContain("<p>The <em>body</em>.</p>");
});

// --- links ---------------------------------------------------------------------

test("renders every link as an anchor with its label and href", () => {
  const html = renderToString(
    <ProjectsView
      projects={[
        syntheticProject({
          name: "A",
          links: [
            { label: "Live", url: "https://a.example" },
            { label: "Source", url: "https://b.example" },
          ],
        }),
      ]}
    />,
  );
  expect(html).toContain(
    '<a class="project-link" href="https://a.example" target="_blank" rel="noreferrer">Live</a>',
  );
  expect(html).toContain(
    '<a class="project-link" href="https://b.example" target="_blank" rel="noreferrer">Source</a>',
  );
});

test("a project with no links renders no anchors", () => {
  const html = renderToString(
    <ProjectsView projects={[syntheticProject({ name: "A" })]} />,
  );
  expect(html.match(/<a /g) ?? []).toHaveLength(0);
});

// --- the real file ----------------------------------------------------------------

test("real file: every project name and link matches data/career.jsonc exactly", () => {
  const html = renderToString(<ProjectsView projects={career.projects} />);
  for (const project of career.projects) {
    expect(html).toContain(`<h3 class="project-name">${project.name}</h3>`);
    for (const link of project.links) {
      expect(html).toContain(
        `<a class="project-link" href="${link.url}" target="_blank" rel="noreferrer">${link.label}</a>`,
      );
    }
  }
  // No separately authored content: exactly one entry per file project.
  const entries = html.match(/class="project-name">/g) ?? [];
  expect(entries).toHaveLength(career.projects.length);
});

// --- empty state --------------------------------------------------------------------

test("an empty list renders a friendly empty state", () => {
  const html = renderToString(<ProjectsView projects={[]} />);
  expect(html).toContain("projects-empty");
  expect(html.match(/<a /g) ?? []).toHaveLength(0);
});
