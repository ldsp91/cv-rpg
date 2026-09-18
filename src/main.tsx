import { createRoot } from "react-dom/client";
import Phaser from "phaser";

// Skeleton entry point. The app is split in two (ADR-0003):
// - Phaser owns the game world, booted once into the stable #game container.
// - React owns the DOM overlay in #ui (landing, dialogue, sheet, CV, projects).
// React must never re-create the element Phaser has mounted into.

class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  create() {
    // Skeleton: empty scene. The world is built here in the real work.
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: 320,
  height: 240,
  backgroundColor: "#101018",
  pixelArt: true,
  scene: [BootScene],
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
