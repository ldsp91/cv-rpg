/**
 * The launch gate: the seam between the landing overlay and Phaser boot.
 *
 * The City scene refuses to start until the player presses "Play
 * Experience" (the React layer flips this flag), so before that the canvas
 * shows only its background behind the opaque landing.
 */
let launched = false;

export function launchGame(): void {
  launched = true;
}

export function gameLaunched(): boolean {
  return launched;
}
