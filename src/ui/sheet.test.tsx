import { test, expect } from "bun:test";
import { renderToString } from "react-dom/server";
import { Sheet } from "./sheet.tsx";

// renderToString inserts <!-- --> between adjacent text expressions;
// strip them so assertions can read the visible text.
const render = (entries: UnlockedSkill[]) =>
  renderToString(<Sheet entries={entries} onClose={() => {}} />).replace(
    /<!--[\s\S]*?-->/g,
    "",
  );
import type { UnlockedSkill } from "../career.ts";

const firstJobTS: UnlockedSkill = {
  skill: {
    name: "TypeScript",
    evidence:
      "<p>Migrated a 60k-line React codebase to strict TypeScript; 3 years of daily use since.</p>",
  },
  locationId: "first-job",
  locationTitle: "First Job",
  period: "2018 – 2022",
};

const currentRoleTS: UnlockedSkill = {
  skill: {
    name: "TypeScript",
    evidence:
      "<p>Daily driver on the current product — API types shared between the frontend and backend, zero `any` in the new code.</p>",
  },
  locationId: "current-role",
  locationTitle: "Current Role",
  period: "2022 – present",
};

test("renders a panel titled 'Character Sheet' with a close button", () => {
  const html = renderToString(<Sheet entries={[]} onClose={() => {}} />);
  expect(html).toContain("Character Sheet");

  expect(html).toMatch(/class="sheet-close"/);
});

test("renders one row per entry, in the order given", () => {
  const nodeJS: UnlockedSkill = {
    skill: { name: "Node.js", evidence: "<p>2+ years of services and tooling.</p>" },
    locationId: "current-role",
    locationTitle: "Current Role",
    period: "2022 – present",
  };
  const html = render([firstJobTS, nodeJS, currentRoleTS]);
  const rows = html.match(/class="sheet-row"/g) ?? [];
  expect(rows.length).toBe(3);
  expect(html.indexOf("Migrated a 60k-line")).toBeLessThan(
    html.indexOf("2+ years of services"),
  );
  expect(html.indexOf("2+ years of services")).toBeLessThan(
    html.indexOf("zero"),
  );
});

test("a row shows the skill name, the Location tag, and the HTML evidence", () => {
  const html = render([firstJobTS]);
  expect(html).toMatch(/class="sheet-skill">TypeScript</);
  // Location tag: title · period
  expect(html).toContain("First Job · 2018 – 2022");
  expect(html).toMatch(/class="sheet-location"/);
  // Evidence is rendered as HTML, not escaped
  expect(html).toContain(
    "<p>Migrated a 60k-line React codebase to strict TypeScript; 3 years of daily use since.</p>",
  );
});

test("a skill at two Locations renders as TWO rows, each tagged with its Location", () => {
  const html = render([firstJobTS, currentRoleTS]);
  const rows = html.match(/class="sheet-row"/g) ?? [];
  expect(rows.length).toBe(2);
  expect(html).toContain("First Job · 2018 – 2022");
  expect(html).toContain("Current Role · 2022 – present");
  // Both pieces of evidence present — no merging or deduping.
  expect(html).toContain("60k-line React codebase");
  expect(html).toContain("zero `any` in the new code");
});

test("empty entries render a friendly empty state", () => {
  const html = renderToString(<Sheet entries={[]} onClose={() => {}} />);
  expect(html).toMatch(/class="sheet-empty"/);
  expect(html.toLowerCase()).toContain("nothing unlocked yet");
  const rows = html.match(/class="sheet-row"/g) ?? [];
  expect(rows.length).toBe(0);
});
