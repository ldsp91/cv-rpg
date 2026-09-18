/**
 * Asset extraction: Kenney 2015 "Roguelike" packs → clean 16×16 tile sheets.
 *
 * The three CC0 source packs (vendored under `assets/source/`, see the
 * README next to them) ship each tileset as ONE big spritesheet whose tiles
 * are 16×16 with a 1px margin between them (pitch 17, tile (i,j) at pixel
 * (i*17, j*17); the characters sheet additionally has a 1px margin after
 * its last column). This script slices every sheet into its 16×16 tiles and
 * repacks them into a clean, margin-free sheet that the game loads directly:
 *
 *   assets/roguelike-rpg.png    57×31 tiles  → 912×496 px
 *   assets/roguelike-city.png   37×28 tiles  → 592×448 px
 *   assets/roguelike-chars.png  54×12 tiles  → 864×192 px
 *
 * Each clean sheet tile (i,j) is its 16×16 block at pixel (i*16, j*16).
 * Frame index = row * cols + col, so (i,j) → frame j*cols + i.
 *
 * Zero dependencies: the zip reader below walks local file headers (the
 * packs use method 0 "stored" or method 8 "deflate") and PNG decode/encode
 * is pure TS over zlib.
 *
 * Run:  bun scripts/extract-tiles.ts
 * Re-run any time; output is deterministic. The test in
 * `scripts/extract-tiles.test.ts` pins the committed output.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { deflateRawSync, inflateRawSync, inflateSync, deflateSync } from "node:zlib";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Byte readers over plain Uint8Arrays (Bun's typed arrays have no
// Buffer-style readUInt* methods)
// ---------------------------------------------------------------------------

function u16le(d: Uint8Array, o: number): number {
  return d[o]! | (d[o + 1]! << 8);
}
function u32le(d: Uint8Array, o: number): number {
  return (d[o]! | (d[o + 1]! << 8) | (d[o + 2]! << 16) | (d[o + 3]! << 24)) >>> 0;
}
function u32be(d: Uint8Array, o: number): number {
  return ((d[o]! << 24) | (d[o + 1]! << 16) | (d[o + 2]! << 8) | d[o + 3]!) >>> 0;
}

// ---------------------------------------------------------------------------
// Zip reader (local file headers only — sufficient for these vendor packs)
// ---------------------------------------------------------------------------

/** Read every file entry of a zip (stored or deflate compressed). */
export function readZip(z: Uint8Array): Map<string, Uint8Array> {
  const entries = new Map<string, Uint8Array>();
  let off = 0;
  while (off + 30 <= z.length) {
    if (z[off] !== 0x50 || z[off + 1] !== 0x4b || z[off + 2] !== 0x03 || z[off + 3] !== 0x04) break;
    const method = u16le(z, off + 8);
    const compSize = u32le(z, off + 18);
    const nameLen = u16le(z, off + 26);
    const extraLen = u16le(z, off + 28);
    const name = new TextDecoder().decode(z.subarray(off + 30, off + 30 + nameLen));
    const dataStart = off + 30 + nameLen + extraLen;
    const raw = z.subarray(dataStart, dataStart + compSize);
    if (!name.endsWith("/")) {
      entries.set(name, method === 8 ? new Uint8Array(inflateRawSync(raw)) : raw.slice());
    }
    off = dataStart + compSize;
  }
  return entries;
}

// ---------------------------------------------------------------------------
// PNG (decode: colortypes 2/3/6, 8-bit; encode: RGBA, filter 0)
// ---------------------------------------------------------------------------

const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function pngChunks(d: Uint8Array): Array<[string, Uint8Array]> {
  for (let i = 0; i < 8; i++) {
    if (d[i] !== PNG_SIG[i]) throw new Error("not a PNG");
  }
  const chunks: Array<[string, Uint8Array]> = [];
  let pos = 8;
  while (pos + 8 <= d.length) {
    const length = u32be(d, pos);
    const type = String.fromCharCode(d[pos + 4]!, d[pos + 5]!, d[pos + 6]!, d[pos + 7]!);
    chunks.push([type, d.subarray(pos + 8, pos + 8 + length)]);
    pos += 12 + length;
    if (type === "IEND") break;
  }
  return chunks;
}

function unfilterScanlines(raw: Uint8Array, w: number, h: number, bpp: number): Uint8Array {
  const stride = w * bpp;
  const out = new Uint8Array(stride * h);
  let prev = new Uint8Array(stride);
  let rp = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[rp]!;
    rp += 1;
    const line = new Uint8Array(stride);
    for (let x = 0; x < stride; x++) line[x] = raw[rp + x]!;
    rp += stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? line[x - bpp]! : 0;
      const b = prev[x]!;
      const c = x >= bpp ? prev[x - bpp]! : 0;
      if (f === 1) line[x] = (line[x]! + a) & 255;
      else if (f === 2) line[x] = (line[x]! + b) & 255;
      else if (f === 3) line[x] = (line[x]! + ((a + b) >> 1)) & 255;
      else if (f === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        line[x] = (line[x]! + pr) & 255;
      } else if (f !== 0) throw new Error(`bad filter ${f}`);
    }
    out.set(line, y * stride);
    prev = line;
  }
  return out;
}

/**
 * Inflate a PNG IDAT payload. The spec says raw deflate, but the Kenney
 * sheets (all three vendored packs) are zlib-wrapped (0x78 header) — accept
 * both: try the wrapped form first, fall back to raw deflate.
 */
function inflateIdat(idat: Uint8Array): Uint8Array {
  if (idat[0] === 0x78) return new Uint8Array(inflateSync(idat));
  return new Uint8Array(inflateRawSync(idat));
}

export interface PngImage {
  width: number;
  height: number;
  /** RGBA, row-major. */
  rgba: Uint8Array;
}

/** Decode an 8-bit PNG (colortypes 2 RGB, 3 palette, 6 RGBA) to RGBA. */
export function decodePng(d: Uint8Array): PngImage {
  const chunks = pngChunks(d);
  let w = 0,
    h = 0,
    bitdepth = 0,
    colortype = 0;
  let idat = new Uint8Array(0);
  let pal: Uint8Array | null = null;
  let trns: Uint8Array | null = null;
  for (const [type, data] of chunks) {
    if (type === "IHDR") {
      w = u32be(data, 0);
      h = u32be(data, 4);
      bitdepth = data[8]!;
      colortype = data[9]!;
    } else if (type === "IDAT") {
      const next = new Uint8Array(idat.length + data.length);
      next.set(idat);
      next.set(data, idat.length);
      idat = next;
    } else if (type === "PLTE") pal = data;
    else if (type === "tRNS") trns = data;
  }
  if (bitdepth !== 8) throw new Error(`bitdepth ${bitdepth} unsupported`);
  if (colortype !== 2 && colortype !== 3 && colortype !== 6) {
    throw new Error(`colortype ${colortype} unsupported`);
  }
  const bpp = colortype === 2 ? 3 : colortype === 6 ? 4 : 1;
  const raw = unfilterScanlines(inflateIdat(idat), w, h, bpp);
  const rgba = new Uint8Array(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    if (colortype === 2) {
      rgba[i * 4] = raw[i * 3]!;
      rgba[i * 4 + 1] = raw[i * 3 + 1]!;
      rgba[i * 4 + 2] = raw[i * 3 + 2]!;
      rgba[i * 4 + 3] = 255;
    } else if (colortype === 6) {
      rgba[i * 4] = raw[i * 4]!;
      rgba[i * 4 + 1] = raw[i * 4 + 1]!;
      rgba[i * 4 + 2] = raw[i * 4 + 2]!;
      rgba[i * 4 + 3] = raw[i * 4 + 3]!;
    } else {
      const idx = raw[i]!;
      if (!pal) throw new Error("palette PNG without PLTE");
      rgba[i * 4] = pal[idx * 3]!;
      rgba[i * 4 + 1] = pal[idx * 3 + 1]!;
      rgba[i * 4 + 2] = pal[idx * 3 + 2]!;
      rgba[i * 4 + 3] = trns && idx < trns.length ? trns[idx]! : 255;
    }
  }
  return { width: w, height: h, rgba };
}

function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  out[0] = data.length >>> 24;
  out[1] = (data.length >>> 16) & 0xff;
  out[2] = (data.length >>> 8) & 0xff;
  out[3] = data.length & 0xff;
  new TextEncoder().encodeInto(type, out.subarray(4, 8));
  out.set(data, 8);
  // CRC-32 over type+data
  let crc = 0xffffffff;
  for (let i = 4; i < out.length - 4; i++) {
    crc ^= out[i]!;
    for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  const crcv = (crc ^ 0xffffffff) >>> 0;
  out[out.length - 4] = crcv >>> 24;
  out[out.length - 3] = (crcv >>> 16) & 0xff;
  out[out.length - 2] = (crcv >>> 8) & 0xff;
  out[out.length - 1] = crcv & 0xff;
  return out;
}

/** Encode RGBA as a PNG (8-bit, filter 0 per scanline). */
export function encodePng(img: PngImage): Uint8Array {
  const { width: w, height: h, rgba } = img;
  const stride = w * 4;
  const raw = new Uint8Array((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    raw.set(rgba.subarray(y * stride, (y + 1) * stride), y * (stride + 1) + 1);
  }
  const ihdr = new Uint8Array(13);
  ihdr[0] = w >>> 24;
  ihdr[1] = (w >>> 16) & 0xff;
  ihdr[2] = (w >>> 8) & 0xff;
  ihdr[3] = w & 0xff;
  ihdr[4] = h >>> 24;
  ihdr[5] = (h >>> 16) & 0xff;
  ihdr[6] = (h >>> 8) & 0xff;
  ihdr[7] = h & 0xff;
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return new Uint8Array([
    ...PNG_SIG,
    ...pngChunk("IHDR", ihdr),
    ...pngChunk("IDAT", new Uint8Array(deflateSync(raw))),
    ...pngChunk("IEND", new Uint8Array(0)),
  ]);
}

// ---------------------------------------------------------------------------
// The actual extraction
// ---------------------------------------------------------------------------

export interface PackSpec {
  /** Key used by the game (texture key / file stem). */
  key: string;
  /** Path of the vendored zip inside assets/source/. */
  zip: string;
  /** Path of the sheet PNG inside the zip (the variant with a transparent margin). */
  sheet: string;
  /** Source sheet grid. */
  cols: number;
  rows: number;
  /** Expected clean output size in pixels (= cols*16 × rows*16). */
  outWidth: number;
  outHeight: number;
}

/**
 * The three packs, with the sheet variant verified to carry a fully
 * transparent 1px margin (the "magenta" file of the city pack is in fact
 * the transparent one — its labels are swapped in the pack).
 */
export const PACKS: PackSpec[] = [
  {
    key: "roguelike-rpg",
    zip: "kenney_roguelike-rpg-pack.zip",
    sheet: "Spritesheet/roguelikeSheet_transparent.png",
    cols: 57,
    rows: 31,
    outWidth: 912,
    outHeight: 496,
  },
  {
    key: "roguelike-city",
    zip: "roguelike-modern-city-pack.zip",
    sheet: "Spritesheet/roguelikeCity_magenta.png",
    cols: 37,
    rows: 28,
    outWidth: 592,
    outHeight: 448,
  },
  {
    key: "roguelike-chars",
    zip: "kenney_roguelike-characters.zip",
    sheet: "Spritesheet/roguelikeChar_transparent.png",
    cols: 54,
    rows: 12,
    outWidth: 864,
    outHeight: 192,
  },
];

/**
 * Slice one source sheet into a clean margin-free RGBA image.
 *
 * Source geometry (verified against the vendored sheets): pitch 17,
 * tile (i,j) at pixel (i*17, j*17), 1px margin between tiles.
 * The inter-tile margin strips are asserted fully transparent — if the
 * source sheet ever changes, this throws instead of silently slicing wrong.
 */
export function extractCleanSheet(sheet: PngImage, spec: PackSpec): PngImage {
  const { cols, rows } = spec;
  const needW = cols * 16 + (cols - 1);
  const needH = rows * 16 + (rows - 1);
  if (sheet.width < needW || sheet.height < needH) {
    throw new Error(
      `sheet too small: ${sheet.width}x${sheet.height} < ${needW}x${needH} for ${spec.key}`,
    );
  }
  const out = new Uint8Array(spec.outWidth * spec.outHeight * 4);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const sx = i * 17;
      const sy = j * 17;
      // assert the 1px margin strips around this tile are transparent
      // (skip the left/top edge of the sheet — there is no margin there)
      for (let t = 0; t < 16; t++) {
        if (i > 0) assertMargin(sx - 1, sy + t, sheet, spec);
        if (i < cols - 1) assertMargin(sx + 16, sy + t, sheet, spec);
        if (j > 0) assertMargin(sx + t, sy - 1, sheet, spec);
        if (j < rows - 1) assertMargin(sx + t, sy + 16, sheet, spec);
      }
      for (let ty = 0; ty < 16; ty++) {
        for (let tx = 0; tx < 16; tx++) {
          const src = ((sy + ty) * sheet.width + (sx + tx)) * 4;
          const dst = ((j * 16 + ty) * spec.outWidth + (i * 16 + tx)) * 4;
          out[dst] = sheet.rgba[src]!;
          out[dst + 1] = sheet.rgba[src + 1]!;
          out[dst + 2] = sheet.rgba[src + 2]!;
          out[dst + 3] = sheet.rgba[src + 3]!;
        }
      }
    }
  }
  return { width: spec.outWidth, height: spec.outHeight, rgba: out };
}

function assertMargin(x: number, y: number, sheet: PngImage, spec: PackSpec): void {
  const a = sheet.rgba[(y * sheet.width + x) * 4 + 3]!;
  if (a !== 0) {
    throw new Error(
      `margin pixel ${x},${y} of ${spec.key} is opaque (alpha ${a}) — source sheet layout changed?`,
    );
  }
}

/** Extract one pack: zip → sheet → clean image → PNG bytes. Pure. */
export function extractPack(zipBytes: Uint8Array, spec: PackSpec): Uint8Array {
  const entries = readZip(zipBytes);
  const entry = entries.get(spec.sheet);
  if (!entry) {
    throw new Error(`zip has no entry ${spec.sheet} (found ${[...entries.keys()].join(", ")})`);
  }
  return encodePng(extractCleanSheet(decodePng(entry), spec));
}

// ---------------------------------------------------------------------------
// CLI entry — run with: bun scripts/extract-tiles.ts
// ---------------------------------------------------------------------------

if (import.meta.main) {
  const root = join(import.meta.dir, "..");
  for (const spec of PACKS) {
    const zipBytes = new Uint8Array(readFileSync(join(root, "assets", "source", spec.zip)));
    const png = extractPack(zipBytes, spec);
    const outPath = join(root, "assets", `${spec.key}.png`);
    writeFileSync(outPath, png);
    console.log(`wrote ${outPath} (${spec.outWidth}x${spec.outHeight})`);
  }
}
