# Art research: free pixel-art tileset + character candidates

Research for ticket [#4](https://github.com/ldsp91/cv-rpg/issues/4) (map [#1](https://github.com/ldsp91/cv-rpg/issues/1)).
Question: surface 2–3 cohesive free-licensed pixel-art candidates — a tileset plus matching character sprites — that fit a career-themed 2D map and are safe for a public portfolio site; recommend one, with reasons.

## Constraints (from the repo)

- **Canvas**: 320×240, `pixelArt: true` — `src/main.tsx` (Phaser 4.2.1, per ADR-0001 / `docs/STACK.md`). A 16×16 tile gives a 20×15 tile viewport at native scale; integer CSS scaling stays crisp.
- **Style**: top-down tilemap "dungeon crawler" (VISION.md), WASD movement, 3–4 career locations (school, university, jobs, projects) with NPC dialogue.
- **Assets**: "No paid assets or art commissions — public/free assets only" (VISION.md no-list; STACK.md: "Art assets: free/public only"). License must allow a **public** site; attribution must be satisfiable.

## Candidate A — Kenney "Roguelike" series (2015): tiles + composable humans

Three packs, one cohesive muted 2015 style, all 16×16, all CC0, all verified by downloading the zips and reading `License.txt` / `spritesheetInfo.txt` inside them.

### A1. Roguelike/RPG pack (Kenney)

- Page: https://kenney.nl/assets/roguelike-rpg-pack — "Tile size 16 × 16", "License Creative Commons CC0", 1,700× files, v1.0 (2015). Tags: rpg, tile, town, furniture, button, panel, roguelike, pixel.
- Zip: https://kenney.nl/media/pages/assets/roguelike-rpg-pack/12c03cd78b-1677697420/kenney_roguelike-rpg-pack.zip
  - `Spritesheet/spritesheetInfo.txt`: "TILE SIZE: 16 x 16, MARGIN: 1". Sheet 968×526 = 57×31 grid = **1,767 tile slots**.
  - `License.txt`: "License: (Creative Commons Zero, CC0) http://creativecommons.org/publicdomain/zero/1.0/ This content is free to use in personal, educational and commercial projects. Support us by crediting Kenney or www.kenney.nl (this is not mandatory)".
  - Contents (from `Sample1.png` / `Sample2.png`): outdoor (forest, lake, paths, houses, camp, cemetery), **indoor rooms** (stone/tiled floors, arched windows, tables, chairs, kitchen, stairs), UI elements, buttons/panels; includes Tiled sample maps (`Map/sample_map.tmx`, `Map/sample_indoor.tmx`).

### A2. Roguelike Modern City pack (Kenney, via OpenGameArt)

- Page: https://opengameart.org/content/roguelike-modern-city-pack — "Over 1,000 different tiles to create modern cities and urban landscapes. Includes everything from roads (various striping), parking, buildings and details. Files: Spritesheet (1.036 sprites)". License badge: **CC0**. Author Kenney, 2015-10-07.
- Zip: https://opengameart.org/sites/default/files/Roguelike%20Modern%20City%20pack.zip
  - `spritesheetInfo.txt`: "The tiles are 16 x 16px and have a 1px margin between them." Sheet 628×475 = 37×28 grid = **1,036 tiles**.
  - `License.txt`: "License (Creative Commons Zero, CC0) … You may use these textures/photographs in personal and commercial projects. Credit (Kenney or www.kenney.nl) would be nice but is not mandatory."
  - Contents (from `Sample.png`): roads with lane striping, crosswalks, traffic lights, street lamps, sidewalks, **shopfronts with awnings**, glass-front office buildings, cars and buses, park areas — a ready-made modern city block set.

### A3. Roguelike Characters (Kenney)

- Page: https://kenney.nl/assets/roguelike-characters — "License Creative Commons CC0", 450× files, v2.0 (2024, "Fixed spritesheet issue"), originally 2015.
- Zip: https://kenney.nl/media/pages/assets/roguelike-characters/53ffff4133-1729196490/kenney_roguelike-characters.zip
  - `spritesheetInfo.txt`: "The tiles are 16 x 16px and have a 1px margin between them." Sheet 918×203 = 54×12 grid.
  - `License.txt`: CC0, same terms as A1.
  - Contents (from `Preview.png`): **modular humanoid characters** — base bodies in ~10 colors, torso/armor pieces, headgear (hats, hoods, helmets), weapons, facial hair; preview documents the composition: base body + armor + head/weapon = character. Single-tile (one 16×16 sprite per character; no walk frames).

**Fit**: protagonist is a composable *human* (career owner); indoor room tiles cover school/office locations; the city pack covers a "TECH CITY" world; 1,767 + 1,036 tiles vastly exceeds v1's needs.

## Candidate B — Kenney "Tiny" series (2022–2024): vivid town/dungeon + creatures

### B1. Tiny Town (Kenney)

- Page: https://kenney.nl/assets/tiny-town — "Tile size 16 × 16", "License Creative Commons CC0", v1.1 (2023), 130× files. Tags: rpg, roguelike, town, overworld, map.
- Zip: https://kenney.nl/media/pages/assets/tiny-town/a415fbeb49-1735736916/kenney_tiny-town.zip
  - 132 individual 16×16 tiles (`Tiles/tile_0000.png`…`tile_0131.png`) + Tiled tilemap.
  - `License.txt`: "License: (Creative Commons Zero, CC0) … This content is free to use in personal, educational and commercial projects. Support us by crediting Kenney or www.kenney.nl (this is not mandatory)".
  - Contents (from `Sample.png`): vivid bright cartoon town — houses, castle, fences, trees, paths. Tile-only; **no human characters**.

### B2. Tiny Dungeon (Kenney)

- Page: https://kenney.nl/assets/tiny-dungeon — "Tile size 16 × 16", "License Creative Commons CC0", v1.0 (2022), 130× files. Tags: rpg, roguelike, dungeon, sewer.
- Zip: https://kenney.nl/media/pages/assets/tiny-dungeon/f8422efb44-1674742415/kenney_tiny-dungeon.zip — 132 tiles + Tiled sample map. `License.txt`: CC0, same terms.
- Contents (from `Sample.png`): fantasy dungeon/indoor — stone walls, torches, chests, furniture. Same vivid style as Tiny Town.

### B3. Tiny Creatures (Clint Bellanger, via OpenGameArt)

- Page: https://opengameart.org/content/tiny-creatures — "This package is an expansion to Kenney's Tiny Dungeon… It is compatible with Kenney's Tiny Dungeon and Tiny Town sets. The creatures are done in 16x16 pixel sprites with thick outlines. … Features: 180 sprites total, Over 100 monsters! Over 50 animals! … License: CC0 1.0 Universal." Also: "License: CC0 1.0 Universal. You're allowed to use these game assets in any project including commercial ones. There's no need to ask permission before using these and giving attribution is not required (but is appreciated!)" and "Made with Kenney's permission."
- Copyright/Attribution Notice on the page: "Tiny Creatures by Clint Bellanger (optional)".
- Zip: https://opengameart.org/sites/default/files/tiny-creatures.zip (180.5 KB, 2024-03-18) — 180 single-tile 16×16 sprites, `License.txt` inside, Tiled sample map.
- **No human sprites** — monsters/animals only (knight, wizard, dragonkin, catfolk, animals…).

**Fit**: one vivid, cohesive style across town + dungeon + creatures; documented compatibility between packs. But the player/NPCs would be creatures, not people, and there is no modern-city coverage.

## Candidates considered and rejected

- **DawnLike tileset** (OpenGameArt, CC-BY 4.0 per third-party mention): page 404 at check time and a thread titled "Licenses Contradictory in different websites" on the page — license ambiguity is disqualifying for a public portfolio site. (Search snippet via web search, 2026-07.)
- **Spelunky inspired Tileset** (TinyWorlds, OpenGameArt, CC0): https://opengameart.org/content/spelunky-inspired-tileset — sidescroll collection (2D::Tile::Sidescroll), wrong projection for the top-down map.
- **Pixelwood Valley** (gowldev.itch.io, "Free + Premium"): free tier of a commercial pack with no verifiable permissive license for public use — not safe to commit to.
- Kenney "Spelunky-style" sidescroll packs and LPC 32×32 (CC-BY-SA, wrong tile size for the 320×240 canvas: only ~10×7 tiles visible) — ruled out on style/projection/license grounds.

## Cross-candidate facts

- Every candidate verified at 16×16 → **20×15 tiles on the 320×240 canvas**; `pixelArt: true` keeps integer scaling crisp.
- **No verified 16×16 CC0 pack includes multi-frame walk animations** — characters are single-tile; v1 can carry this with free pixel movement (and at most a 2-frame bob) on one sprite.
- All candidates are **CC0 1.0**: no attribution legally required for public use; optional credit (Kenney / Kenney.nl, "Tiny Creatures by Clint Bellanger") is cheap and expected — satisfiable via a one-line footer credit.

## Recommendation

**Candidate A — the Kenney 2015 "Roguelike" series** (Roguelike/RPG pack + Roguelike Modern City pack + Roguelike Characters).

Reasons:

1. **Human characters are available.** Roguelike Characters composes a person (body color, armor, headgear, weapon, facial hair) — the career map's protagonist is the owner, and NPC dialogue needs people. Candidate B's only character pack (Tiny Creatures) is monsters/animals.
2. **Indoor coverage matches career locations.** A1 has classroom/office-style rooms (desks, chairs, stairs, kitchen, arched windows) — school, university, and office locations are indoors. Tiny Dungeon is a fantasy dungeon, not an office.
3. **Modern city coverage matches the world theme.** A2 (roads, shopfronts, offices, transit) directly supports the "TECH CITY" naming option in VISION.md's open questions. Candidate B has no modern urban tiles.
4. **Uniformly CC0 and size-verified.** All three packs' `License.txt` state CC0 (public domain) with credit optional; all are 16×16 on the 1px-margin grid; total ≈ 2,800+ tiles for a 3–4-location v1 world.
5. **Bonus ergonomics**: packs ship Tiled sample maps and sprite sheets with magenta-keyed versions — no slicing work beyond Phaser's texture frame setup.

Trade-off to weigh at the pick (ticket #5): A's palette is muted and earthy (2015 style); B is the more vivid, modern-looking option. If the owner prefers B's look, the human-character gap is the price (creature protagonist, or mixing in a third pack breaks the "cohesive" requirement).
