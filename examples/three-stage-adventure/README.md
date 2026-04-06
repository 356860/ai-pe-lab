# Three-Stage Adventure Playground

`three-stage-adventure` is a browser game controlled by body motion.

It is designed as a public example inside `AI PE Lab`, showing how one pose pipeline can drive multiple classroom-style activity modes in the same scene.

## Stages

- `Forest`: run in place and jump over logs
- `River`: use both arms to row faster
- `Reef`: choose a direction and jump with both feet to land on the next platform

## What This Example Demonstrates

- full-body pose input with `MediaPipe Pose`
- browser-only 3D scenes with `Three.js`
- a small state machine for multi-stage classroom gameplay
- zero-install deployment through static hosting

## Input Mapping

- raising one hand during setup starts the calibration flow
- hip position decides lane or direction
- both feet leaving the ground at the same time counts as a jump
- repeated arm motion increases speed in running and rowing sections

## Run It

Serve the repository with any static server, then open:

```text
/examples/three-stage-adventure/
```

The example works best in a modern desktop browser with camera permissions enabled.

## Screenshots

<p align="center">
  <img src="../../docs/screenshots/three-stage-start.png" alt="Start screen" width="49%">
  <img src="../../docs/screenshots/three-stage-forest.png" alt="Forest mode" width="49%">
</p>
<p align="center">
  <img src="../../docs/screenshots/three-stage-river.png" alt="River mode" width="49%">
  <img src="../../docs/screenshots/three-stage-reef.png" alt="Reef mode" width="49%">
</p>

## Source Layout

- `src/config.js`: game constants and text
- `src/audio.js`: speech and simple browser sound effects
- `src/ui.js`: DOM updates and start-screen flow
- `src/scene.js`: Three.js environment and player rendering
- `src/game.js`: runtime state machine and score logic
- `src/pose.js`: MediaPipe Pose and camera bootstrap
- `src/main.js`: page entrypoint

## Known Limitations

- movement thresholds are still tuned for demonstration, not all body sizes or camera angles
- this version does not yet save session history
- lighting and camera placement in real classrooms can affect pose quality

## Good Next Improvements

- add a result summary panel
- make thresholds configurable
- add score persistence
- add more obstacle variations per stage
- add screenshots or GIFs for the root README
