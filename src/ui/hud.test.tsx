import { test, expect } from "bun:test";
import { renderToString } from "react-dom/server";
import { Hud } from "./hud.tsx";

test("renders exactly three buttons: Sheet, Resume, Projects", () => {
  const html = renderToString(<Hud view="none" onToggle={() => {}} />);
  const buttons = html.match(/<button/g) ?? [];
  expect(buttons.length).toBe(3);
  expect(html).toContain(">Sheet</button>");
  expect(html).toContain(">Resume</button>");
  expect(html).toContain(">Projects</button>");
});

test("the open view is highlighted (active class + aria-pressed), the others are not", () => {
  const html = renderToString(<Hud view="sheet" onToggle={() => {}} />);
  expect(html).toContain(
    'class="hud-btn hud-btn-active" aria-pressed="true">Sheet</button>',
  );
  expect(html).toContain('class="hud-btn" aria-pressed="false">Resume</button>');
  expect(html).toContain('class="hud-btn" aria-pressed="false">Projects</button>');
});

test("no view: no button is active", () => {
  const html = renderToString(<Hud view="none" onToggle={() => {}} />);
  expect(html).not.toContain("hud-btn-active");
  expect(html.match(/aria-pressed="true"/g) ?? []).toHaveLength(0);
});
