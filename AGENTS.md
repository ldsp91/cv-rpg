## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";
import { createRoot } from "react-dom/client";

// import .css files directly and it works
import './index.css';

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.

## Agent skills

### Issue tracker

Issues and specs live in GitHub Issues (via the `gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-label vocabulary, one label per canonical role. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

# About the Project:

Resume RPG is a 2D browser RPG where my career is the map — every milestone becomes a location, and completing its challenges unlocks the real skills and experience behind it, with a traditional CV always one click away.

## Map

- `docs/VISION.md` — the vision; read it for the "why" behind the project.
- `docs/STACK.md` — the chosen stack: every major technical decision with its reasoning.
- `CONTEXT.md` — the glossary of the project's terms; created when the first term crystallises.
- `docs/adr/` — the project's decisions, one file per decision (`NNNN-slug.md`); created when the first decision crystallises.
- `skills/` — the project's procedures.

## Hard rules

- Decisions go to `docs/adr/` as `NNNN-slug.md`.
- Glossary terms go to `CONTEXT.md`.
- `AGENTS.md` stays a map plus hard rules — content goes into the documents it points to.
