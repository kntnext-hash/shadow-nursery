# Web Prototype

Purpose: validate the feel of Shadow Nursery before committing to Godot/mobile production.

The native iOS SwiftUI/SpriteKit Phase 1 remains in the repo, but active iteration moves to a browser prototype because this Windows Codex environment can run and inspect it directly.

## Current Track

Current phase: Web-2 - Vertical Slice Prototype

Goals:

- Render a quiet room with a procedural shadow in the corner.
- Let light angle and intensity affect the shadow immediately.
- Let basic furniture positions affect the shadow state.
- Persist state locally with `localStorage`.
- Show a memory panel and quiet prompt overlay.
- Provide enough interaction to judge tone, pacing, and visual direction.
- Unlock and move between multiple rooms.
- Make each room alter the screenshot mood and the shadow's silhouette context.
- Add room-specific notes that feel like clues, not tutorials.
- Keep the prototype strong enough to judge whether this should become a Godot product.

## Product Direction

This is not a mass-market idle game tuned around missions, ads, stamina, gachas, or daily chores.

The value is atmosphere:

- The room.
- The silence.
- The act of observing.
- Memory fragments.
- Unease without explanation.

The closest commercial shape is an art-leaning, interpretation-friendly indie game. The prototype should make screenshots feel like something players want to inspect, share, and discuss.

Design priorities:

- Make the room visually readable in a single screenshot.
- Make the shadow feel like a phenomenon, not a character.
- Make furniture placement visibly change the shadow.
- Let the shadow evolve through roughly 20 visible form steps: pool, stain, lifted edge, wall mark, tendril-like smears, and finally an unstable absence. Do not label them as levels in the UI.
- Preserve ambiguity.
- Avoid reward language.
- Avoid turning the loop into chores.
- Learn from ICO-like restraint: pale light, desaturated stone, large quiet negative space, weak UI presence, and loneliness without explanation.
- Avoid making the palette read as generic blue horror. Use overexposed light and soft washed surfaces against the shadow.
- Treat each prop as a clue in the screenshot, not decoration.

Future revenue fit:

- Premium purchase first.
- DLC room packs later.
- Memory/audio/photo fragment packs only if they deepen the world.
- Steam and Switch should be considered alongside mobile.

## References Learned

ICO and related Fumito Ueda work are useful references because they rely on subtraction, silence, scale, minimal UI, sparse story, and desaturated/overexposed light rather than explicit horror. The prototype should borrow those principles, not the literal castle setting.

Nearby market references:

- ICO / Shadow of the Colossus / The Last Guardian: subtraction, pale light, scale, isolation.
- INSIDE / Little Nightmares: readable silhouettes and instantly shareable screenshots.
- Rusty Lake: object-as-clue structure and interpretation loops.
- Milk inside a bag of milk inside a bag of milk: small audience, strong tone, memorable text.
- Kind Words: intimacy and quiet ritual, but without turning the shadow into a social companion.

Non-goals:

- Mobile app packaging.
- Godot implementation.
- Native notifications, haptics, or platform audio.
- Complete balance.
- Final art.

## Web-2 Acceptance

- Main room, hallway, child room, and empty room can be reached through progression.
- Room changes are visible without reading text.
- The same shadow feels different in each room.
- Furniture and room context both influence the shadow's shape.
- A 15-day simulated run shows meaningful visual escalation.
- The browser console has no errors.

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
