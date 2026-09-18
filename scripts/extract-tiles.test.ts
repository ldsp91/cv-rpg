import { test, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PACKS, extractPack, decodePng, readZip } from "./extract-tiles";

const root = join(import.meta.dir, "..");

function zipOf(spec: (typeof PACKS)[number]): Uint8Array {
  return new Uint8Array(readFileSync(join(root, "assets", "source", spec.zip)));
}
function committedOf(spec: (typeof PACKS)[number]): Uint8Array {
  return new Uint8Array(readFileSync(join(root, "assets", `${spec.key}.png`)));
}

for (const spec of PACKS) {
  test(`${spec.key}: committed sheet is exactly what extraction produces from the vendored zip`, () => {
    const fresh = extractPack(zipOf(spec), spec);
    expect([...fresh]).toEqual([...committedOf(spec)]);
  });

  test(`${spec.key}: committed sheet is ${spec.cols * 16}x${spec.rows * 16} and carries source tiles margin-free`, () => {
    const committed = decodePng(committedOf(spec));
    expect(committed.width).toBe(spec.cols * 16);
    expect(committed.height).toBe(spec.rows * 16);

    // Spot-check a mid-sheet tile against the raw source sheet: the tile's
    // 16×16 block must be identical at the clean position (i*16, j*16).
    const sourceEntry = readZip(zipOf(spec)).get(spec.sheet);
    expect(sourceEntry).toBeDefined();
    const source = decodePng(sourceEntry!);
    const i = 5;
    const j = 3;
    for (let ty = 0; ty < 16; ty++) {
      for (let tx = 0; tx < 16; tx++) {
        const s = ((j * 17 + ty) * source.width + (i * 17 + tx)) * 4;
        const c = ((j * 16 + ty) * committed.width + (i * 16 + tx)) * 4;
        expect([
          committed.rgba[c]!,
          committed.rgba[c + 1]!,
          committed.rgba[c + 2]!,
          committed.rgba[c + 3]!,
        ]).toEqual([
          source.rgba[s]!,
          source.rgba[s + 1]!,
          source.rgba[s + 2]!,
          source.rgba[s + 3]!,
        ]);
      }
    }
  });
}
