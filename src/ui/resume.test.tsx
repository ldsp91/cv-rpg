import { test, expect } from "bun:test";
import { renderToString } from "react-dom/server";
import career from "../../data/career.jsonc";
import { deriveCV, type CV } from "../career.ts";
import { Resume } from "./resume.tsx";

// --- helpers -----------------------------------------------------------------

function syntheticCV(overrides: Partial<CV> = {}): CV {
  return {
    name: "Jane Doe",
    headline: "Software Engineer",
    summary: "<p>Ships small, careful things.</p>",
    links: [{ label: "GitHub", url: "https://github.com/jane" }],
    experience: [
      {
        title: "First Job",
        period: "2018 – 2022",
        skills: [
          {
            name: "React",
            evidence: "<p>4 years of daily use.</p>",
          },
        ],
      },
    ],
    ...overrides,
  };
}

/** Escape a plain-string value the way React renders it as text. */
function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// --- header --------------------------------------------------------------------

test("renders the name as the header's largest text, with the headline beneath it", () => {
  const html = renderToString(<Resume cv={syntheticCV()} />);
  expect(html).toContain('<h2 class="resume-name">Jane Doe</h2>');
  expect(html).toContain('<p class="resume-headline">Software Engineer</p>');
  expect(html.indexOf("resume-name")).toBeLessThan(html.indexOf("resume-headline"));
});

test("renders the summary as HTML", () => {
  const html = renderToString(
    <Resume cv={syntheticCV({ summary: "<p>Ships <em>small</em> things.</p>" })} />,
  );
  expect(html).toContain("<p>Ships <em>small</em> things.</p>");
});

test("renders every player link as an anchor with its label and href", () => {
  const html = renderToString(
    <Resume
      cv={syntheticCV({
        links: [
          { label: "GitHub", url: "https://github.com/jane" },
          { label: "Website", url: "https://jane.dev" },
        ],
      })}
    />,
  );
  expect(html).toContain(
    '<a class="resume-link" href="https://github.com/jane" target="_blank" rel="noreferrer">GitHub</a>',
  );
  expect(html).toContain(
    '<a class="resume-link" href="https://jane.dev" target="_blank" rel="noreferrer">Website</a>',
  );
});

test("a player with no links renders no anchors in the header", () => {
  const html = renderToString(<Resume cv={syntheticCV({ links: [] })} />);
  expect(html.match(/<a /g) ?? []).toHaveLength(0);
});

// --- experience ------------------------------------------------------------------

test("renders one entry per experience entry, in the given order, with title and period verbatim", () => {
  const html = renderToString(
    <Resume
      cv={syntheticCV({
        experience: [
          { title: "Alpha Co", period: "2010 – 2014", skills: [] },
          { title: "Beta Labs", period: "2014 – present", skills: [] },
        ],
      })}
    />,
  );
  const titles =
    html.match(/<span class="resume-entry-title">[^<]+<\/span>/g) ?? [];
  expect(titles).toEqual([
    '<span class="resume-entry-title">Alpha Co</span>',
    '<span class="resume-entry-title">Beta Labs</span>',
  ]);
  const periods =
    html.match(/<span class="resume-entry-period">[^<]+<\/span>/g) ?? [];
  expect(periods).toEqual([
    '<span class="resume-entry-period">2010 – 2014</span>',
    '<span class="resume-entry-period">2014 – present</span>',
  ]);
});

test("renders one bullet per skill: the name emphasized, then its evidence HTML", () => {
  const html = renderToString(
    <Resume
      cv={syntheticCV({
        experience: [
          {
            title: "Alpha Co",
            period: "2010 – 2014",
            skills: [
              { name: "HTML & CSS", evidence: "<p>First <em>website</em>.</p>" },
              { name: "Teamwork", evidence: "<p>4 years of shared pizza.</p>" },
            ],
          },
        ],
      })}
    />,
  );
  const bullets = html.match(/<li class="resume-skill">[\s\S]*?<\/li>/g) ?? [];
  expect(bullets).toHaveLength(2);
  expect(bullets[0]).toContain("<em class=\"resume-skill-name\">HTML &amp; CSS</em>");
  expect(bullets[0]).toContain("<p>First <em>website</em>.</p>");
  expect(bullets[1]).toContain("<em class=\"resume-skill-name\">Teamwork</em>");
  expect(bullets[1]).toContain("<p>4 years of shared pizza.</p>");
});

test("an empty CV renders the header and an empty experience list, without crashing", () => {
  const html = renderToString(
    <Resume
      cv={{ name: "A", headline: "B", summary: "<p>C</p>", links: [], experience: [] }}
    />,
  );
  expect(html).toContain('<h2 class="resume-name">A</h2>');
  expect(html.match(/class="resume-entry"/g) ?? []).toHaveLength(0);
});

// --- the real file ----------------------------------------------------------------

test("real file: every location's title, period, and each skill's name + evidence match data/career.jsonc", () => {
  const html = renderToString(<Resume cv={deriveCVForTest()} />);
  for (const location of career.locations) {
    expect(html).toContain(
      `<span class="resume-entry-title">${esc(location.title)}</span>`,
    );
    expect(html).toContain(
      `<span class="resume-entry-period">${esc(location.period)}</span>`,
    );
    for (const skill of location.skills) {
      expect(html).toContain(
        `<em class="resume-skill-name">${esc(skill.name)}</em>`,
      );
      expect(html).toContain(skill.evidence);
    }
  }
  // No separately authored content: exactly one entry per file location.
  const entries = html.match(/class="resume-entry"/g) ?? [];
  expect(entries).toHaveLength(career.locations.length);
});

test("real file: the gate never leaks into the rendered CV", () => {
  const html = renderToString(<Resume cv={deriveCVForTest()} />);
  expect(html).not.toContain(career.gate.title);
  expect(html).not.toContain(career.gate.html);
});

test("real file: the projects never leak into the rendered CV", () => {
  const html = renderToString(<Resume cv={deriveCVForTest()} />);
  for (const project of career.projects) {
    expect(html).not.toContain(project.name);
    expect(html).not.toContain(project.html);
  }
});

test("real file: the player header matches data/career.jsonc", () => {
  const html = renderToString(<Resume cv={deriveCVForTest()} />);
  expect(html).toContain(`<h2 class="resume-name">${esc(career.player.name)}</h2>`);
  expect(html).toContain(
    `<p class="resume-headline">${esc(career.player.headline)}</p>`,
  );
  expect(html).toContain(career.player.summary);
  for (const link of career.player.links) {
    expect(html).toContain(
      `<a class="resume-link" href="${link.url}" target="_blank" rel="noreferrer">${esc(link.label)}</a>`,
    );
  }
});

// The component is dumb — the host passes deriveCV(career). The tests
// reproduce that contract; the component itself never imports the file.
function deriveCVForTest(): CV {
  return deriveCV(career);
}
