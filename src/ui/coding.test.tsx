import { test, expect } from "bun:test";
import { renderToString } from "react-dom/server";
import { Coding } from "./coding.tsx";
import career from "../../data/career.jsonc";
import type { CodingChallenge } from "../types";

// The real current-role coding challenge — the one the demo solves.
const challenge = career.locations
  .map((location) => location.challenge)
  .find((ch): ch is CodingChallenge => ch.type === "coding")!;
expect(challenge.type).toBe("coding");

function render(ch: CodingChallenge): string {
  return renderToString(
    <Coding challenge={ch} onSolved={() => {}} onDone={() => {}} />,
  );
}

test("renders the context HTML as the story paragraph", () => {
  const html = render(challenge);
  expect(html).toContain("The login check is broken");
  expect(html).toContain("Fix the operator.");
});

test("root element carries the coding class", () => {
  const html = render(challenge);
  expect(html).toMatch(/^<div class="coding">/);
});

test("renders one row per line of code, numbered in the gutter", () => {
  const html = render(challenge);
  const lines = challenge.code.split("\n");
  expect(lines).toHaveLength(3);
  for (let i = 0; i < lines.length; i++) {
    expect(html).toContain(`<span class="coding-linenum">${i + 1}</span>`);
  }
});

test("the blank line renders an inline input between the before and after text", () => {
  const html = render(challenge);
  expect(html).toContain('<input class="coding-input"');

  const before = "return user.age ";
  const after = " 18;";
  const beforeIdx = html.indexOf(before);
  const inputIdx = html.indexOf('class="coding-input"');
  const afterIdx = html.indexOf(after);
  expect(beforeIdx).toBeGreaterThan(-1);
  expect(afterIdx).toBeGreaterThan(inputIdx);
  expect(beforeIdx).toBeLessThan(inputIdx);
});

test("multi-line snippet renders every line verbatim", () => {
  const html = render(challenge);
  expect(html).toContain("function canLogin(user) {");
  expect(html).toContain("return user.age ");
  // The blank itself is the input, not literal underscores.
  expect(html).not.toContain("____");
});

test("synthetic challenge: single-line blank renders the input inline", () => {
  const html = render({
    type: "coding",
    context: "<p>Something broke.</p>",
    code: "let ok = a ____ b;",
    fix: "==",
    explanation: "<p>Why.</p>",
  });
  expect(html).toContain("let ok = a ");
  expect(html).toContain('<input class="coding-input"');
  expect(html).toContain(" b;");
});
