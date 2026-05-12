# Phase Current

Project: Shadow Nursery

Status: Not started

Current phase: Phase 1 - Project Foundation

## Phase 1 Scope

Implement only the project foundation.

Required:

- Create iOS SwiftUI project
- Add SpriteKit scene embedded in SwiftUI
- Implement all data models
- Implement `PersistenceService` using CoreData
- Implement `DefaultGameState` factory
- Show a basic placeholder room scene

Do not implement yet:

- Growth systems
- Memory systems
- Prompt systems
- Multi-room gameplay
- Audio
- Haptics
- Notifications
- Tutorial or extra UI

## Phase 1 Acceptance

- App launches
- Blank/basic room is visible
- Placeholder shadow ellipse is visible in the corner
- App does not crash
- Project compiles

## Implementation Notes

- Keep game logic out of SwiftUI views.
- Views observe. Systems think.
- Use `// TODO(phase N):` for future phase hooks.
- Do not add features outside the active phase.
- Keep the tone quiet and minimal.

## Progress Log

- 2026-05-13: Created project coordination docs.

## Next Codex Prompt

```text
Read AGENTS.md, PHASE_CURRENT.md, SCHEMA.md, and CONTENT.md first. Implement Phase 1 only. Do not implement features from later phases. When finished, run the available build checks and update PHASE_CURRENT.md.
```
