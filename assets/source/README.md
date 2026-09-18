# Source art (CC0)

The three Kenney (kenney.nl) 2015 "Roguelike" packs, vendored so the tile
extraction is reproducible offline. All CC0 1.0 — public domain, credit
optional; the site carries the one-line footer credit "Art: Kenney
(kenney.nl), CC0" per ADR-0004.

| File | Pack | Sheet in the zip |
| --- | --- | --- |
| `kenney_roguelike-rpg-pack.zip` | Roguelike/RPG pack (outdoors + indoor rooms) | `Spritesheet/roguelikeSheet_transparent.png` (968×526) |
| `roguelike-modern-city-pack.zip` | Roguelike Modern City pack | `Spritesheet/roguelikeCity_magenta.png` (628×475) |
| `kenney_roguelike-characters.zip` | Roguelike Characters (composable humans) | `Spritesheet/roguelikeChar_transparent.png` (918×203) |

All sheets: 16×16 tiles, 1px margin between tiles (pitch 17, tile (i,j) at
pixel (i·17, j·17); the characters sheet also has a 1px trailing margin on
its last column).

Note: in the city pack the "transparent"/"magenta" file names are swapped —
`roguelikeCity_magenta.png` is the variant whose 1px margins are actually
transparent. The RPG and Characters packs name theirs correctly.
`scripts/extract-tiles.ts` asserts the margin transparency it relies on.

Sources (re-fetched 2026-09, matching the zip-verified research in
`docs/research/art-pack.md` on branch `research/art-pack`):

- https://kenney.nl/assets/roguelike-rpg-pack
- https://opengameart.org/content/roguelike-modern-city-pack
- https://kenney.nl/assets/roguelike-characters

The game never loads these zips; it loads the extracted clean sheets
(margin-free, tiles at (i·16, j·16)) written to `assets/*.png` by
`bun run extract`.
