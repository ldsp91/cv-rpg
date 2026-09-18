import { createRoot } from "react-dom/client";
import Phaser from "phaser";
import { CityScene } from "./city";

// Skeleton entry point. The app is split in two (ADR-0003):
// - Phaser owns the game world, booted once into the stable #game container.
// - React owns the DOM overlay in #ui (landing, dialogue, sheet, CV, projects).
// React must never re-create the element Phaser has mounted into.

class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  create() {
    // Hand off to the game world. The scene list's first scene (Boot) is the
    // only one that auto-starts.
    this.scene.start("City");
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: 320,
  height: 240,
  backgroundColor: "#101018",
  pixelArt: true,
  physics: { default: "arcade", arcade: { debug: false } },
  scene: [BootScene, CityScene],
});

const ui = document.getElementById("ui");
if (ui) {
  createRoot(ui).render(
    <main>
      <h1>Resume RPG</h1>
      <p>Skeleton in place — the game world and career content land next.</p>
    </main>,
  );
}
