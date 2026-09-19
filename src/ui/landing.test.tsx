import { test, expect } from "bun:test";
import { renderToString } from "react-dom/server";
import { Landing } from "./landing";
import type { Player, World } from "../types";

const world: World = {
  name: "Tech City",
  blurb: "<p>Walk the blocks.</p>",
};

const player: Player = {
  name: "Your Name",
  headline: "Full-Stack Web Developer",
  summary: "<p>…</p>",
  links: [{ label: "GitHub", url: "https://github.com/x" }],
};

// The callbacks are irrelevant to the static HTML — stubs.
const noop = () => {};

function labels(html: string): string[] {
  const buttons = [...html.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/g)];
  return buttons.map((m) => (m[1] ?? "").replace(/<[^>]+>/g, "").trim());
}

test("renders the world name, blurb, player header, and three actions", () => {
  const html = renderToString(
    <Landing world={world} player={player} onPlay={noop} onResume={noop} onProjects={noop} />,
  );
  expect(html).toContain("Tech City");
  expect(html).toContain("Walk the blocks.");
  expect(html).toContain("Your Name");
  expect(html).toContain("Full-Stack Web Developer");
  expect(html).toContain("https://github.com/x");
  expect(labels(html)).toEqual([
    "Play Experience",
    "View Resume",
    "View Projects",
  ]);
});

test("renders the three actions without a world", () => {
  const html = renderToString(
    <Landing world={undefined} player={player} onPlay={noop} onResume={noop} onProjects={noop} />,
  );
  expect(labels(html)).toEqual([
    "Play Experience",
    "View Resume",
    "View Projects",
  ]);
});
