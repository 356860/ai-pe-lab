# Contributing

Thanks for your interest in improving `AI PE Lab`.

This repository is still early, so the goal is to keep contribution flow lightweight and easy to understand.

## Good First Contribution Areas

- improve pose threshold reliability
- polish mobile browser behavior
- refine UI feedback and teaching cues
- improve docs, screenshots, and demo guidance
- add new browser-based PE examples under `examples/`

## Before You Open a Pull Request

1. Open an issue first if the change is large or changes game behavior.
2. Keep the scope focused on one problem or improvement.
3. Prefer browser-friendly solutions that still work on static hosting.
4. Document any behavior change in the relevant README.

## Implementation Guidelines

- keep examples easy to read and easy to host
- avoid adding heavy build tooling unless it clearly improves maintainability
- prefer small modules over large single-file rewrites
- preserve the teaching context of the examples when adding new features

## Testing Expectations

For browser examples, please verify at least:

- the page loads over a static server
- the main screen renders without console errors
- the main interaction path still works in a modern browser

## Pull Request Notes

When you open a PR, include:

- what changed
- why it helps
- what you tested
- any remaining limitations or follow-up ideas

