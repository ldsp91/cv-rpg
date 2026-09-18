# Resume RPG is a 2D browser RPG where my career is the map — every milestone becomes a location, and completing its challenges unlocks the real skills and experience behind it, with a traditional CV always one click away.

## Why

A traditional resume tells a recruiter what I can do. It doesn't let them experience it. Resume RPG flips that: instead of recruiters simply reading a resume, they explore my career as a game — and every skill and every piece of experience shows up by completing a challenge, not by reading a bullet point.

The goal is a resume that is memorable, interactive, and fun, while still providing a professional, easily accessible traditional CV for recruiters who don't want to play. The ideal reaction: "I've never seen a CV like this before."

## What

A small, playable 2D browser RPG / dungeon crawler. The player explores a world that represents my professional journey:

- Every location is a real career milestone — school, university, jobs, projects, team experiences, initiatives.
- Each location contains a small challenge — puzzle, quiz, quest, coding puzzle, dialogue, or resource challenge — and different milestones use different mechanics, so no two locations feel the same.
- Completing a challenge unlocks the skills and experience that a CV would list, shown as real evidence (years, projects, usage) rather than arbitrary RPG numbers.
- Progression mirrors the real career timeline, from education through first and professional experience, projects, and leadership, to the current role.
- The final boss is a multi-skill challenge that combines everything unlocked on the journey — a metaphor for the complete professional journey.
- The recruiter is never forced to play. The landing screen offers: Play Experience (the full RPG), View Resume (a traditional CV), and View Projects (a portfolio view). The game enhances the CV — it does not replace it.

All career content lives in a JSON file, with the text written as HTML that the game renders. The game is a reusable template: write the career into the JSON, and it renders as the game.

The final product should feel like a portfolio that happens to be a game — not a game that happens to contain a portfolio. Someone visiting should discover who I am, what I've done, what I can do, what I've built, and where I'm going — by exploring, not scrolling.

## Who

- Recruiters and technical interviewers, primarily for senior/full-stack web developer roles — framed general enough to survive a pivot. Most won't have time to play; the traditional CV is one click away.
- Anyone with three minutes: peers, friends, the curious.

## Scope

**In scope (v1):** one small playable world — WASD/arrow-key movement, a pixel-art character on a tilemap, 3–4 career locations with NPC dialogue, a quest system, one or two simple puzzles, a skill-unlock system, a character sheet, project information, a traditional CV button always one click away, a responsive browser UI, deployable as a static website. All content driven from the JSON file.

**Not in scope (explicit no list):**

- No backend, no server — pure static site
- No accounts, login, or server-side state (browser `localStorage` at most)
- No multiplayer or social features
- No native app or mobile packaging (desktop-first browser; mobile-friendly is a bonus, not a requirement)
- No paid assets or art commissions — public/free assets only
- No recruiter mode (3-minute guided paths) in v1 — future
- English only

**Deferred to after v1** (noted in the original notes, not committed): multiple maps, more quests, enemies, boss fights, XP, inventory, achievements, dialogue trees, hidden areas, easter eggs; detailed project pages, GitHub/LinkedIn integration, downloadable PDF CV, certificates, references, timeline; recruiter mode, role-specific journeys, skill filtering.

## Open questions

- Which real career entries populate the map — the mechanism is settled (a JSON file with HTML text the owner can fill out without reading code); the entries themselves are still to be written.
