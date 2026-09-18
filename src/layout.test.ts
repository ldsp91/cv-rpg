import { test, expect } from "bun:test";
import { career } from "./career";
import {
  buildCityLayout,
  cityFrame,
  blockCenterCol,
  gateStartCol,
  TILE,
  WORLD_ROWS,
  FACADE_ROWS,
  SIDEWALK_NORTH,
  ROAD_ROWS,
  SIDEWALK_SOUTH,
  PLAZA_TOP,
  SPAN_MARGIN,
  PITCH,
  BLOCK_W,
  GATE_W,
} from "./layout";
import { CITY } from "./tiles";

const layout = buildCityLayout(career);
const n = career.locations.length; // 4 in the career file

test("world shape: rows fixed, width derived from location count", () => {
  expect(layout.rows).toBe(WORLD_ROWS);
  expect(layout.cols).toBe(gateStartCol(n) + GATE_W + 3);
  expect(layout.cols).toBeGreaterThan(n * PITCH);
});

test("locations lay out in file (timeline) order, equally spaced", () => {
  for (let i = 0; i < n; i++) {
    expect(layout.locations[i]!.id).toBe(career.locations[i]!.id);
    expect(layout.locations[i]!.title).toBe(career.locations[i]!.title);
    expect(layout.locations[i]!.blockCols).toEqual([
      SPAN_MARGIN + i * PITCH,
      SPAN_MARGIN + i * PITCH + BLOCK_W - 1,
    ]);
  }
  // Each block strictly after the previous one — order is visible on the map.
  for (let i = 1; i < n; i++) {
    expect(layout.locations[i]!.blockCols[0]).toBeGreaterThan(
      layout.locations[i - 1]!.blockCols[1],
    );
  }
});

test("block centers are on the street and inside the world", () => {
  for (let i = 0; i < n; i++) {
    const cx = layout.locations[i]!.npc.x;
    expect(cx).toBe(blockCenterCol(i) * TILE);
    expect(cx).toBeGreaterThan(0);
    expect(cx).toBeLessThan(layout.cols * TILE);
    // The center sits inside the block's own columns.
    const [start, end] = layout.locations[i]!.blockCols;
    expect(cx).toBeGreaterThanOrEqual(start * TILE);
    expect(cx).toBeLessThanOrEqual((end + 1) * TILE);
  }
});

test("the gate is at the far end, beyond every location", () => {
  const lastEnd = layout.locations[n - 1]!.blockCols[1];
  expect(layout.gate.startCol).toBe(gateStartCol(n));
  expect(layout.gate.startCol).toBeGreaterThan(lastEnd);
  expect(layout.gate.title).toBe(career.gate.title);
  // The gate facade occupies exactly GATE_W columns of the skyline.
  for (let c = layout.gate.startCol; c < layout.gate.startCol + GATE_W; c++) {
    for (let r = 0; r < FACADE_ROWS; r++) {
      const frame = layout.frames[r]![c]!;
      const [row, col] = [
        Math.floor(frame / 37),
        frame % 37,
      ];
      const [g0, g1] = CITY.facadeGroups[CITY.gateGroup]!;
      expect(col >= g0 && col <= g1).toBe(true);
    }
  }
});

test("every cell of the world is filled (no empty holes)", () => {
  for (let y = 0; y < layout.rows; y++) {
    for (let x = 0; x < layout.cols; x++) {
      expect(layout.frames[y]![x]).not.toBe(-1);
    }
  }
});

test("street band: sidewalks and road span the whole world", () => {
  const lampCols = new Set(layout.props.filter((p) => p.role === "lamp" && p.row === SIDEWALK_NORTH).map((p) => p.col));
  for (let c = 0; c < layout.cols; c++) {
    const north = layout.frames[SIDEWALK_NORTH]![c];
    if (lampCols.has(c)) {
      expect(north).toBe(cityFrame(CITY.lamp.row, CITY.lamp.col));
    } else {
      expect(north).toBe(cityFrame(CITY.sidewalk.row, CITY.sidewalk.col));
    }
    for (const r of ROAD_ROWS) {
      expect(layout.frames[r]![c]).toBe(cityFrame(CITY.road.row, CITY.road.col));
    }
    expect(layout.frames[SIDEWALK_SOUTH]![c]).toBe(cityFrame(CITY.sidewalk.row, CITY.sidewalk.col));
    for (let r = PLAZA_TOP; r < layout.rows; r++) {
      expect(layout.frames[r]![c]).not.toBe(cityFrame(CITY.road.row, CITY.road.col));
    }
  }
});

test("facade skyline spans the whole world, solid on every facade frame", () => {
  for (let c = 0; c < layout.cols; c++) {
    for (let r = 0; r < FACADE_ROWS; r++) {
      const frame = layout.frames[r]![c]!;
      expect(layout.roleByFrame[frame]).toBe("facade");
      expect(layout.solidFrames).toContain(frame);
    }
  }
});

test("each block wears its own material; gaps wear the background", () => {
  for (let i = 0; i < n; i++) {
    const [start, end] = layout.locations[i]!.blockCols;
    const [g0, g1] = CITY.facadeGroups[i % CITY.facadeGroups.length]!;
    for (let c = start; c <= end; c++) {
      for (let r = 0; r < FACADE_ROWS; r++) {
        const frame = layout.frames[r]![c]!;
        expect(frame % 37 >= g0 && frame % 37 <= g1).toBe(true);
      }
    }
  }
});

test("NPCs stand in the plaza, one per Location, not on solid tiles", () => {
  for (let i = 0; i < n; i++) {
    const npc = layout.locations[i]!.npc;
    const col = Math.floor(npc.x / TILE);
    const row = Math.floor(npc.y / TILE);
    expect(row).toBeGreaterThanOrEqual(PLAZA_TOP);
    expect(row).toBeLessThan(layout.rows);
    const frame = layout.frames[row]![col]!;
    expect(layout.solidFrames).not.toContain(frame);
  }
});

test("props do not overlap each other, NPCs, or the gate", () => {
  const seen = new Set<string>();
  for (const p of layout.props) {
    const key = `${p.row}:${p.col}`;
    expect(seen.has(key)).toBe(false);
    seen.add(key);
    expect(p.col).toBeGreaterThanOrEqual(0);
    expect(p.col).toBeLessThan(layout.cols);
    expect(p.row).toBeGreaterThanOrEqual(0);
    expect(p.row).toBeLessThan(layout.rows);
    // The prop frame actually sits in that cell.
    const frame = layout.frames[p.row]![p.col]!;
    expect(layout.roleByFrame[frame]).toBe(p.role);
    // And the cell is solid (a prop is street furniture, not a gap).
    expect(layout.solidFrames).toContain(frame);
  }
  // No prop on an NPC cell.
  for (let i = 0; i < n; i++) {
    const npc = layout.locations[i]!.npc;
    expect(seen.has(`${Math.floor(npc.y / TILE)}:${Math.floor(npc.x / TILE)}`)).toBe(false);
  }
});

test("the street is a walkable path from spawn to the gate", () => {
  // Flood-fill from the spawn over walkable (non-solid) cells; the cell
  // under the gate and every NPC cell must be reachable.
  const solid = new Set(layout.solidFrames);
  const key = (x: number, y: number) => `${x},${y}`;
  const startCol = Math.floor(layout.spawn.x / TILE);
  const startRow = Math.floor(layout.spawn.y / TILE);
  const seen = new Set<string>([key(startCol, startRow)]);
  const queue: Array<[number, number]> = [[startCol, startRow]];
  while (queue.length > 0) {
    const [x, y] = queue.pop()!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= layout.cols || ny >= layout.rows) continue;
      const k = key(nx, ny);
      if (seen.has(k)) continue;
      if (solid.has(layout.frames[ny]![nx]!)) continue;
      seen.add(k);
      queue.push([nx, ny]);
    }
  }
  expect(seen.size).toBeGreaterThan(100); // the walkable band, not just the spawn
  for (let i = 0; i < n; i++) {
    const npc = layout.locations[i]!.npc;
    expect(seen.has(key(Math.floor(npc.x / TILE), Math.floor(npc.y / TILE)))).toBe(true);
  }
  const gateCol = layout.gate.startCol + Math.floor(GATE_W / 2);
  // The street row in front of the gate (the road's middle row).
  expect(seen.has(key(gateCol, ROAD_ROWS[1]!))).toBe(true);
});

test("gateStartCol and blockCenterCol are pure functions of order", () => {
  expect(blockCenterCol(0)).toBe(SPAN_MARGIN + BLOCK_W / 2);
  expect(blockCenterCol(1)).toBe(SPAN_MARGIN + PITCH + BLOCK_W / 2);
  expect(gateStartCol(1)).toBe(SPAN_MARGIN + PITCH + BLOCK_W + 2);
  expect(gateStartCol(2)).toBe(gateStartCol(1) + PITCH);
});
