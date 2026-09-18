import { test, expect } from "bun:test";
import { renderToString } from "react-dom/server";
import { Quiz } from "./quiz.tsx";
import type { QuizQuestion } from "../types.ts";

const questions: QuizQuestion[] = [
  {
    question: "<p>First question?</p>",
    options: ["<b>Option A</b>", "Option B", "Option C"],
    answer: 1,
    note: "<p>Why option B.</p>",
  },
  {
    question: "<p>Second question?</p>",
    options: ["Option D", "Option E"],
    answer: 0,
  },
  {
    question: "<p>Third question?</p>",
    options: ["Option F", "Option G"],
    answer: 1,
  },
];

const noop = () => {};

test("initial render shows the first question's text and all of its options as buttons", () => {
  const html = renderToString(
    <Quiz questions={questions} onSolved={noop} onDone={noop} />,
  );
  expect(html).toContain('class="quiz"');
  expect(html).toContain("First question?");
  expect(html).toContain("<b>Option A</b>");
  expect(html).toContain("Option B");
  expect(html).toContain("Option C");
  const buttons = html.match(/<button/g) ?? [];
  expect(buttons.length).toBe(3);
});

test("a multi-question quiz hides the later questions initially", () => {
  const html = renderToString(
    <Quiz questions={questions} onSolved={noop} onDone={noop} />,
  );
  expect(html).not.toContain("Second question");
  expect(html).not.toContain("Third question");
  expect(html).not.toContain("Option D");
  expect(html).not.toContain("Option F");
});

test("a question without a note renders cleanly — no note block in the initial render", () => {
  const bare: QuizQuestion[] = [
    { question: "<p>Solo?</p>", options: ["Yes", "No"], answer: 0 },
  ];
  const html = renderToString(
    <Quiz questions={bare} onSolved={noop} onDone={noop} />,
  );
  expect(html).toContain("Solo?");
  expect(html).not.toContain('class="quiz-note"');
});

test("the progress label shows the question count", () => {
  const html = renderToString(
    <Quiz questions={questions} onSolved={noop} onDone={noop} />,
  );
  expect(html).toContain("Question 1 of 3");
});
