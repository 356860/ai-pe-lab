# Architecture Notes

The first public example in this repo is intentionally small but already split into clear browser modules.

## Module Map

- `src/main.js`
  Boots the page, binds the start button, creates the scene, audio, pose controller, and game runtime.

- `src/config.js`
  Central constants for mode names, thresholds, UI labels, and motion tuning.

- `src/ui.js`
  DOM reads and UI updates: score, lives, energy, status dots, target arrow, toast messages, and start-screen transitions.

- `src/audio.js`
  Lightweight browser audio helper for speech prompts, looped background rhythm, and short effects.

- `src/scene.js`
  All Three.js environment work: ground, water, player model, scenery, obstacles, and reef platforms.

- `src/game.js`
  The runtime state machine that connects pose input with scoring, collisions, mode changes, and game flow.

- `src/pose.js`
  MediaPipe Pose bootstrapping and camera stream lifecycle.

## Why This Split

The original classroom prototype was a single HTML file. For public sharing, this repo now separates:

- game rules
- scene rendering
- pose capture
- UI updates
- audio feedback

That makes the example easier to review, extend, and maintain in public.

