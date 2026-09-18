import { test, expect } from "bun:test";
import { renderToString } from "react-dom/server";
import { Dialogue } from "./dialogue.tsx";

test("nameplate shows the NPC name", () => {
  const html = renderToString(
    <Dialogue
      locationId="school"
      npcName="Ms. Rivera, homeroom teacher"
      locationTitle="School"
      lines={["<p>Hello.</p>"]}
      visibleCount={1}
      onAdvance={() => {}}
    />,
  );
  expect(html).toContain("Ms. Rivera, homeroom teacher");
});

test("nameplate falls back to the Location title when the NPC name is empty", () => {
  const html = renderToString(
    <Dialogue
      locationId="school"
      npcName=""
      locationTitle="School"
      lines={["<p>Hello.</p>"]}
      visibleCount={1}
      onAdvance={() => {}}
    />,
  );
  expect(html).toContain("School");
});

test("renders exactly visibleCount bubbles, one line each, in order", () => {
  const html = renderToString(
    <Dialogue
      locationId="school"
      npcName="Ms. Rivera"
      locationTitle="School"
      lines={[
        "<p>Line one.</p>",
        "<p>Line two.</p>",
        "<p>Line three.</p>",
      ]}
      visibleCount={2}
      onAdvance={() => {}}
    />,
  );
  const bubbles = html.match(/class="dialogue-bubble"/g) ?? [];
  expect(bubbles.length).toBe(2);
  expect(html).toContain("<p>Line one.</p>");
  expect(html).toContain("<p>Line two.</p>");
  expect(html).not.toContain("Line three");
  expect(html.indexOf("Line one.")).toBeLessThan(html.indexOf("Line two."));
});

test("reveals all bubbles when visibleCount reaches the line count", () => {
  const html = renderToString(
    <Dialogue
      locationId="school"
      npcName="Ms. Rivera"
      locationTitle="School"
      lines={["<p>Only.</p>"]}
      visibleCount={1}
      onAdvance={() => {}}
    />,
  );
  const bubbles = html.match(/class="dialogue-bubble"/g) ?? [];
  expect(bubbles.length).toBe(1);
  expect(html).toContain("<p>Only.</p>");
});

test("hint says to continue while lines are left to reveal", () => {
  const html = renderToString(
    <Dialogue
      locationId="school"
      npcName="Ms. Rivera"
      locationTitle="School"
      lines={["<p>One.</p>", "<p>Two.</p>"]}
      visibleCount={1}
      onAdvance={() => {}}
    />,
  );
  const hint = html.match(/class="dialogue-hint">([^<]*)</);
  const hintText = hint?.[1] ?? "";
  expect(hintText.toLowerCase()).toContain("continue");
});

test("hint says the next advance finishes the conversation when fully revealed", () => {
  const html = renderToString(
    <Dialogue
      locationId="school"
      npcName="Ms. Rivera"
      locationTitle="School"
      lines={["<p>One.</p>", "<p>Two.</p>"]}
      visibleCount={2}
      onAdvance={() => {}}
    />,
  );
  const hint = html.match(/class="dialogue-hint">([^<]*)</);
  expect(hint?.[1]).toBe("Enter or click to finish");
});
