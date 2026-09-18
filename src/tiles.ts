/**
 * Tile catalog for Tech City — where every tile comes from in the Kenney
 * 2015 "Roguelike" sheets (clean 16×16, no margins; see
 * scripts/extract-tiles.ts). A `Cell` is a (row, col) in its sheet; the
 * frame index is `row * COLUMNS + col` (sheets are row-major).
 *
 * All art is from the three packs (ADR-0004). Coordinates were picked
 * against the verified clean sheets; the live world renders from these, so
 * any swap is a one-line change here.
 */

export const SHEET_COLS = {
  city: 37,
  chars: 54,
  rpg: 57,
} as const;

export const SHEET_ROWS = {
  city: 28,
  chars: 12,
  rpg: 31,
} as const;

export type Sheet = keyof typeof SHEET_COLS;

export interface Cell {
  sheet: Sheet;
  row: number;
  col: number;
}

/** Frame index for a cell in its (row-major) sheet. */
export function cellIndex(cell: Cell): number {
  return cell.row * SHEET_COLS[cell.sheet] + cell.col;
}

export const CITY = {
  /** Plain dark asphalt (uniform, mean brightness 64). The walkable street. */
  road: { sheet: "city", row: 19, col: 11 } as Cell,
  /** Light paving. The walkable sidewalks. */
  sidewalk: { sheet: "city", row: 16, col: 4 } as Cell,
  /** Grass of the open plaza south of the street (walkable). */
  grass: { sheet: "city", row: 25, col: 0 } as Cell,
  /** Building facades, one 4-column material group per building:
   *  brick (c0-3), stone (c4-7), tan (c8-11), glass (c12-15),
   *  white/green office (c16-19). Rows 0-5 top to bottom. */
  facadeGroups: [
    [0, 3],
    [4, 7],
    [8, 11],
    [12, 15],
    [16, 19],
  ] as const,
  /** The white/green office building — the gate at the far end. */
  gateGroup: 4,
  /** A street lamp (solid). */
  lamp: { sheet: "city", row: 11, col: 21 } as Cell,
  /** A tree (solid). */
  tree: { sheet: "city", row: 10, col: 34 } as Cell,
  /** A bench (solid). */
  bench: { sheet: "city", row: 12, col: 15 } as Cell,
} as const;

export const CHARS = {
  /** Full composable figures: columns 0-1, rows 0-11 (24 distinct humans).
   *  Each is a single 16×16 tile — no walk frames exist in the packs, so
   *  movement is free pixel motion with at most a 2-frame bob (ADR-0004). */
  player: { sheet: "chars", row: 0, col: 0 } as Cell,
  /** One distinct figure per Location, in the file's location order. */
  npcs: [
    { sheet: "chars", row: 1, col: 1 },
    { sheet: "chars", row: 5, col: 0 },
    { sheet: "chars", row: 4, col: 1 },
    { sheet: "chars", row: 8, col: 0 },
  ] as Cell[],
} as const;

/**
 * Solid (colliding) tile roles. Everything else in the layout is walkable.
 * The scene assigns a gid per role; collision is set per gid.
 */
export const SOLID_ROLES = ["facade", "gate", "lamp", "tree", "bench"] as const;
export type SolidRole = (typeof SOLID_ROLES)[number];
