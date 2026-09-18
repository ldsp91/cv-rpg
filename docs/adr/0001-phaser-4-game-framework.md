# Phaser 4 as the game framework

Context: the game world (pixel-art character on a tilemap, WASD/arrow movement, NPC triggers, simple collisions) needs a 2D engine, and the vision bounds it to a small, pure-static site. We decided on Phaser 4, pinned at v4.2.1 (stable since April 2026, still shipping — v4.2.1 published 2026-07-09, verified at decision time).

Why: it is the only maintained candidate we considered. Its tilemap, keyboard input, scene and trigger systems map one-to-one onto the vision's mechanics, it ships TypeScript types and an ESM build, and a single static download absorbs the framework's size.

Considered options:
- **Kaplay** (successor of the deprecated Kaboom): lightweight and purpose-built for small games, but its last release was 2025-06-15 — over a year old at decision time. A portfolio that must keep running for recruiters cannot sit on a stalled engine.
- **PixiJS 8**: a WebGL renderer only — no game loop, input, or collision. Choosing it means hand-rolling everything an engine exists to buy, plus WebGL capability the scope never spends.
- **Bare canvas**: maximum control, but a hand-rolled tilemap, collision and input layer for the same scope.
