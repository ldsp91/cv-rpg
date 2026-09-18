/**
 * Tech City's auto layout — derived from the career file's location order.
 *
 * The owner never writes coordinates: `career.locations[0]` is the first
 * block after the spawn, `locations[1]` the next, and the gate sits at the
 * far end (see the career file's "HOW TO ADD A LOCATION" note). Everything
 * here is computed from the array order plus fixed street constants, so a
 * fifth Location (or a different order) re-lays the city with no code change.
 *
 * Pure module: no Phaser, no DOM — trivially testable.
 *
 * Tile addressing: cells of the city sheet are identified by their
 * row-major frame index (`row * 37 + col`); the scene renders
 * `putTileAt(1 + frame)` (tileset firstGid is 1, see src/city.ts).
 */

import type { Career } from "./types";
import { CITY, SHEET_COLS } from "./tiles";

/** All tiles are 16×16. */
export const TILE = 16;

/** The world's rows, top to bottom:
 *  0-5   facade skyline (solid)
 *  6     north sidewalk (walkable)
 *  7-9   street (walkable)
 *  10    south sidewalk (walkable)
 *  11-14 plaza: props, NPCs, signs (walkable)
 */
export const WORLD_ROWS = 15;
export const FACADE_ROWS = 6;
export const SIDEWALK_NORTH = 6;
export const ROAD_ROWS = [7, 8, 9] as const;
export const SIDEWALK_SOUTH = 10;
export const PLAZA_TOP = 11;

/** Street constants: where blocks sit along the street. */
export const SPAN_MARGIN = 4; // columns before the first block (spawn span)
export const BLOCK_W = 4; // one facade material group, no seams
export const PITCH = 12; // columns from one block start to the next
export const GATE_W = 4;

/** City-sheet frame index for a (row, col) cell. */
export function cityFrame(row: number, col: number): number {
  return row * SHEET_COLS.city + col;
}

/** The block center of the i-th Location (0-based), in tile-edge units:
 *  `start + BLOCK_W/2` lands exactly on the middle tile edge, so
 *  `blockCenterCol(i) * TILE` is the block's center in pixels. */
export function blockCenterCol(i: number): number {
  return SPAN_MARGIN + i * PITCH + BLOCK_W / 2;
}

/** Where the gate starts (after the last block, one gap wide). */
export function gateStartCol(locationCount: number): number {
  return SPAN_MARGIN + locationCount * PITCH + BLOCK_W + 2;
}

export interface LayoutLocation {
  id: string;
  title: string;
  npcName: string;
  /** Block facade: [startCol, endCol] inclusive, rows 0..5. */
  blockCols: [number, number];
  /** NPC standing in the plaza, in px (sprite center). */
  npc: { x: number; y: number };
  /** NPC nameplate and Location title sign, in px (text anchor points). */
  nameplate: { x: number; y: number };
  sign: { x: number; y: number };
}

export interface LayoutProp {
  role: "lamp" | "tree" | "bench";
  col: number;
  row: number;
}

export interface CityLayout {
  cols: number;
  rows: number;
  /** City-sheet frame index per cell — `frames[row][col]`; -1 means empty
   *  (frame 0 is a real tile: the top-left of the brick facade group). */
  frames: number[][];
  /** Frame index → role name (road, sidewalk, grass, facade, lamp, ...). */
  roleByFrame: Record<number, string>;
  /** Every solid frame (tile collision is set on these). */
  solidFrames: number[];
  spawn: { x: number; y: number };
  locations: LayoutLocation[];
  gate: { title: string; startCol: number; center: { x: number; y: number }; sign: { x: number; y: number } };
  props: LayoutProp[];
}

/**
 * Build the whole city from the career file. The only file content read:
 * location order and titles (plus the gate's title) — never a coordinate.
 */
export function buildCityLayout(career: Career): CityLayout {
  const n = career.locations.length;
  const gateStart = gateStartCol(n);
  const cols = gateStart + GATE_W + 3; // gate + right margin
  const rows = WORLD_ROWS;

  const roleByFrame: Record<number, string> = {};
  const solidFrames: number[] = [];
  const frameOf = (row: number, col: number, role: string, solid: boolean): number => {
    const f = cityFrame(row, col);
    if (roleByFrame[f] === undefined) {
      roleByFrame[f] = role;
      if (solid) solidFrames.push(f);
    }
    return f;
  };

  const road = frameOf(CITY.road.row, CITY.road.col, "road", false);
  const sidewalk = frameOf(CITY.sidewalk.row, CITY.sidewalk.col, "sidewalk", false);
  const grass = frameOf(CITY.grass.row, CITY.grass.col, "grass", false);
  const lamp = frameOf(CITY.lamp.row, CITY.lamp.col, "lamp", true);
  const tree = frameOf(CITY.tree.row, CITY.tree.col, "tree", true);
  const bench = frameOf(CITY.bench.row, CITY.bench.col, "bench", true);
  // Facade frames: one per (material group, row) — 5 groups x 6 rows.
  const facade: number[][] = CITY.facadeGroups.map(([c0]) =>
    Array.from({ length: FACADE_ROWS }, (_, r) =>
      frameOf(r, c0, "facade", true),
    ),
  );
  const gateRow = facade[CITY.gateGroup];

  // ---- grid ----------------------------------------------------------------
  const frames: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(-1));

  // Facade skyline across the whole top: each block wears its own material;
  // the spans between blocks wear stone (group 1) as background buildings.
  const blockCols: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const start = SPAN_MARGIN + i * PITCH;
    blockCols.push([start, start + BLOCK_W - 1]);
  }
  for (let r = 0; r < FACADE_ROWS; r++) {
    for (let c = 0; c < cols; c++) {
      let group = 1; // stone for the background
      for (let i = 0; i < n; i++) {
        const [bs, be] = blockCols[i]!;
        if (c >= bs && c <= be) group = i % CITY.facadeGroups.length;
      }
      if (c >= gateStart && c < gateStart + GATE_W) group = CITY.gateGroup;
      frames[r]![c] = facade[group]![r]!;
    }
  }
  // Street, sidewalks, plaza.
  for (let c = 0; c < cols; c++) {
    frames[SIDEWALK_NORTH]![c] = sidewalk;
    for (const r of ROAD_ROWS) frames[r]![c] = road;
    frames[SIDEWALK_SOUTH]![c] = sidewalk;
    for (let r = PLAZA_TOP; r < rows; r++) frames[r]![c] = grass;
  }

  // ---- props (deterministic from the order) ---------------------------------
  const props: LayoutProp[] = [];
  // Lamps on the north sidewalk: one in front of each block, plus spawn/far end.
  for (let i = 0; i < n; i++) {
    props.push({ role: "lamp", col: blockCenterCol(i), row: SIDEWALK_NORTH });
  }
  props.push({ role: "lamp", col: 1, row: SIDEWALK_NORTH });
  const lampFar = gateStart + GATE_W + 2;
  if (lampFar < cols) props.push({ role: "lamp", col: lampFar, row: SIDEWALK_NORTH });
  // Trees in the plaza, one per gap.
  for (let i = 0; i < n; i++) {
    props.push({ role: "tree", col: SPAN_MARGIN + i * PITCH + BLOCK_W + 4, row: PLAZA_TOP + 2 });
  }
  // Benches in the plaza, in front of each block.
  for (let i = 0; i < n; i++) {
    props.push({ role: "bench", col: blockCenterCol(i) + 2, row: PLAZA_TOP });
  }
  for (const p of props) {
    frames[p.row]![p.col] = p.role === "lamp" ? lamp : p.role === "tree" ? tree : bench;
  }

  // ---- entities -------------------------------------------------------------
  const locations: LayoutLocation[] = career.locations.map((loc, i) => {
    // blockCenterCol is the block's center in pixels-per-tile units already
    // (start + W/2 lands on a tile edge), so no half-tile added.
    const cx = blockCenterCol(i) * TILE;
    return {
      id: loc.id,
      title: loc.title,
      npcName: loc.npcName ?? "",
      blockCols: blockCols[i]!,
      npc: { x: cx, y: (PLAZA_TOP + 1.5) * TILE }, // row 12, centered
      nameplate: { x: cx, y: (PLAZA_TOP + 1) * TILE - 16 }, // just above the NPC's head
      sign: { x: cx, y: (rows - 0.5) * TILE - 14 },
    };
  });

  return {
    cols,
    rows,
    frames,
    roleByFrame,
    solidFrames,
    spawn: { x: 2.5 * TILE, y: 8.5 * TILE }, // on the street, left span
    locations,
    gate: {
      title: career.gate.title,
      startCol: gateStart,
      center: { x: (gateStart + GATE_W / 2) * TILE, y: 3 * TILE },
      sign: { x: (gateStart + GATE_W / 2) * TILE, y: 4.5 * TILE },
    },
    props,
  };
}
