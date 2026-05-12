# Web Prototype

Purpose: validate the feel of Shadow Nursery before committing to Godot/mobile production.

The native iOS SwiftUI/SpriteKit Phase 1 remains in the repo, but active iteration moves to a browser prototype because this Windows Codex environment can run and inspect it directly.

## Current Track

Current phase: Web-1 - Playable Feel Prototype

Goals:

- Render a quiet room with a procedural shadow in the corner.
- Let light angle and intensity affect the shadow immediately.
- Let basic furniture positions affect the shadow state.
- Persist state locally with `localStorage`.
- Show a memory panel and quiet prompt overlay.
- Provide enough interaction to judge tone, pacing, and visual direction.

Non-goals:

- Mobile app packaging.
- Godot implementation.
- Native notifications, haptics, or platform audio.
- Complete balance.
- Final art.

## How To Run

Open:

```text
web-prototype/index.html
```

Or serve the folder locally:

```text
node web-prototype/server.js
```

Then open:

```text
http://127.0.0.1:4173
```

## Migration Plan

The prototype should produce decisions about:

- Shadow silhouette style.
- Light-control feel.
- UI density.
- Memory and prompt tone.
- Whether Godot is the right production target.

After Web-1 is approved, port the validated model and logic to Godot as data/resources/scripts.

