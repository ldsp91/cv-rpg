/**
 * Tech City — the playable career world (issue #8).
 *
 * Art: the three Kenney 2015 "Roguelike" packs (ADR-0004). The city sheet is
 * rendered through a blank tilemap layer (the pattern verified by the dry
 * run: make.tilemap + addTilesetImage + createBlankLayer + putTileAt); the
 * characters sheet is loaded as a 16×16 spritesheet so frame indices are
 * real. Layout comes from src/layout.ts — derived from the career file's
 * location order, never from coordinates.
 */

import Phaser from "phaser";
import cityUrl from "../assets/roguelike-city.png";
import charsUrl from "../assets/roguelike-chars.png";
import { career } from "./career";
import { buildCityLayout, TILE, type CityLayout } from "./layout";
import { CHARS, cellIndex } from "./tiles";

/** Walking speed in px/s (6 tiles/s). */
const SPEED = 96;
/** The player's body, smaller than the 16×16 sprite for forgiving collisions. */
const BODY = 12;
/** The walking bob: a ~1px vertical body oscillation while moving
 *  (peak velocity 20 px/s over a 320 ms period → ~1px amplitude).
 *  It must be a body-level motion, not a sprite render offset: the body
 *  re-syncs from the sprite every frame, so a render-only bob would be
 *  absorbed into the body and drift the player away. */
const BOB_SPEED = 20;
const BOB_PERIOD_MS = 320;

type Keys = {
  left: Phaser.Input.Keyboard.Key[];
  right: Phaser.Input.Keyboard.Key[];
  up: Phaser.Input.Keyboard.Key[];
  down: Phaser.Input.Keyboard.Key[];
};

export class CityScene extends Phaser.Scene {
  private layout!: CityLayout;
  private player!: Phaser.Physics.Arcade.Sprite;
  private keys!: Keys;
  private bobMs = 0;

  constructor() {
    super("City");
  }

  preload() {
    this.load.image("city", cityUrl);
    // Clean sheet of 16×16 frames — load as a spritesheet so frame indices
    // are real (load.image + a numeric frame silently falls back to the
    // whole sheet, which breaks body positioning and tile collision).
    this.load.spritesheet("chars", charsUrl, { frameWidth: 16, frameHeight: 16 });
  }

  create() {
    this.layout = buildCityLayout(career);
    const { cols, rows } = this.layout;

    // ---- tilemap -----------------------------------------------------------
    // make.tilemap for a blank map requires tileWidth/tileHeight explicitly —
    // they default to 32, which lays 16px tiles on a 32px grid (checkerboard).
    const map = this.make.tilemap({
      data: [],
      tileWidth: 16,
      tileHeight: 16,
      width: cols,
      height: rows,
    });
    const tileset = map.addTilesetImage("city", "city", 16, 16, 0, 0, 1);
    if (!tileset) throw new Error("city tileset failed");
    const layer = map.createBlankLayer("city", tileset, 0, 0, cols, rows, 16, 16);
    if (!layer) throw new Error("city layer failed");
    this.add.existing(layer);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const frame = this.layout.frames[y]![x]!;
        if (frame !== -1) layer.putTileAt(1 + frame, x, y);
      }
    }
    map.setCollision(this.layout.solidFrames.map((f) => 1 + f), true);

    // ---- player -------------------------------------------------------------
    const hero = CHARS.player;
    this.player = this.physics.add.sprite(
      this.layout.spawn.x,
      this.layout.spawn.y,
      "chars",
      cellIndex(hero),
    );
    this.player.body!.setSize(BODY, BODY).setOffset(2, 2);
    // Phaser 4 does not default this on: without it the player walks
    // straight out of the world at the far edge.
    (this.player.body! as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
    this.player.setDepth(10);
    this.physics.add.collider(this.player, layer);

    // ---- NPCs: one figure standing at each Location -------------------------
    for (let i = 0; i < this.layout.locations.length; i++) {
      const loc = this.layout.locations[i]!;
      const cell = CHARS.npcs[i % CHARS.npcs.length]!;
      // staticImage (NOT image!): in Phaser 4 add.image creates a DYNAMIC
      // body, so the player would shove the NPC out of the world. A static
      // body keeps the NPC standing still: the player collides with it but
      // can never push it.
      const npc = this.physics.add.staticImage(loc.npc.x, loc.npc.y, "chars", cellIndex(cell));
      npc.setDepth(10);
      this.physics.add.collider(this.player, npc);
      this.textAt(loc.nameplate.x, loc.nameplate.y, loc.npcName, NAME, NAME_WRAP);
      this.textAt(loc.sign.x, loc.sign.y, loc.title, TITLE);
    }

    // ---- the gate at the far end -------------------------------------------
    this.textAt(this.layout.gate.sign.x, this.layout.gate.sign.y, this.layout.gate.title, TITLE);

    // ---- bounds, camera, input ----------------------------------------------
    const w = cols * TILE;
    const h = rows * TILE;
    this.physics.world.setBounds(0, 0, w, h);
    const cam = this.cameras.main;
    cam.setBounds(0, 0, w, h);
    cam.startFollow(this.player, true, 0.2, 0.2);

    // Debug/test handle (used by agent testing; harmless in production).
    (globalThis as unknown as Record<string, unknown>).__city = {
      scene: this,
      player: this.player,
      layout: this.layout,
    };

    const kb = this.input.keyboard!;
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = {
      left: [kb.addKey(K.A), kb.addKey(K.LEFT)],
      right: [kb.addKey(K.D), kb.addKey(K.RIGHT)],
      up: [kb.addKey(K.W), kb.addKey(K.UP)],
      down: [kb.addKey(K.S), kb.addKey(K.DOWN)],
    };
  }

  /** Centered text at (x, y). Nameplates wrap to the block pitch. */
  private textAt(x: number, y: number, content: string, style: Phaser.Types.GameObjects.Text.TextStyle, wrapWidth?: number): Phaser.GameObjects.Text {
    const text = this.add.text(x, y, content, style);
    text.setOrigin(0.5);
    if (wrapWidth !== undefined) {
      text.setWordWrapWidth(wrapWidth);
    }
    text.setDepth(20);
    return text;
  }

  private down(keys: Phaser.Input.Keyboard.Key[]): boolean {
    return keys.some((k) => k.isDown);
  }

  override update() {
    let dx = (this.down(this.keys.right) ? 1 : 0) - (this.down(this.keys.left) ? 1 : 0);
    let dy = (this.down(this.keys.down) ? 1 : 0) - (this.down(this.keys.up) ? 1 : 0);
    const moving = dx !== 0 || dy !== 0;
    if (moving && dx !== 0 && dy !== 0) {
      // Keep diagonal speed equal to straight-line speed.
      dx *= Math.SQRT1_2;
      dy *= Math.SQRT1_2;
    }
    this.player.setVelocity(dx * SPEED, dy * SPEED);

    // The bob adds a small vertical velocity on top of the walking speed.
    // (Body-level, see BOB_SPEED.)
    if (moving) {
      this.bobMs += this.game.loop.delta;
      this.player.body!.velocity.y +=
        Math.sin((this.bobMs / BOB_PERIOD_MS) * Math.PI * 2) * BOB_SPEED;
    } else {
      this.bobMs = 0;
    }
  }
}

/** NPC nameplate style. The positional add.text(x, y, text, style)
 *  signature takes the style object directly (not a TextConfig). */
const NAME: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: "monospace",
  fontSize: "7px",
  color: "#cfcfe0",
  align: "center",
};
/** Location / gate title style. */
const TITLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: "monospace",
  fontSize: "8px",
  fontStyle: "bold",
  color: "#ffd75e",
};
/** Nameplates wrap so they never spill into the neighboring block. */
const NAME_WRAP = 150;
