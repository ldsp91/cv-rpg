# UI split: Phaser owns the canvas, React owns the DOM overlay

Context: the vision's content is "text written as HTML that the game renders", and it asks for a responsive browser UI plus a traditional CV always one click away. We decided to split the UI in two: the game world renders on Phaser's canvas, while everything else — landing, NPC dialogue, character sheet, CV, projects — is HTML/CSS in a DOM overlay built with React.

Why: career content is HTML by definition, so rendering it in the DOM costs no layout work; a CV must be responsive, accessible and printable, which a canvas cannot be. React is the workspace's documented DOM stack (HTML imports + React + HMR on Bun) and suits a stateful overlay (unlocked skills, quest flags). The rule that keeps the halves from colliding: Phaser boots exactly once into the stable `#game` container, and React never re-renders it.

Considered options:
- **All-canvas UI** (Phaser scenes for dialogue, sheet and CV): a consistent in-game look, but HTML content and a printable, accessible CV would have to be faked inside the renderer.
- **React + bare canvas** (no engine): would have required hand-rolling the tilemap, input and collision layer (see ADR-0001).
