import { test, expect } from "bun:test";
import { renderToString } from "react-dom/server";
import type { Gate } from "../types";
import { Capstone } from "./capstone.tsx";

const GATE: Gate = {
  title: "The Final Gate",
  html: "<p>Every milestone complete.</p>",
};

test("marks the journey complete with the exact text", () => {
  const html = renderToString(<Capstone gate={GATE} />);
  expect(html).toContain("Journey complete");
});

test("shows the gate's title", () => {
  const html = renderToString(<Capstone gate={GATE} />);
  expect(html).toContain("The Final Gate");
});

test("renders the gate's html message exactly once", () => {
  const html = renderToString(<Capstone gate={GATE} />);
  expect(html).toContain("<p>Every milestone complete.</p>");
  expect(html.match(/<p>Every milestone complete\.<\/p>/g) ?? []).toHaveLength(1);
});

test("is non-dismissible: no close button, no dismiss affordance", () => {
  const html = renderToString(<Capstone gate={GATE} />);
  expect(html.match(/<button/g) ?? []).toHaveLength(0);
});
