# Phase Current

Project: Shadow Nursery

Status: Pivoted to Web prototype for local visual iteration

Current phase: Web-1 - Playable Feel Prototype

## Active Direction

The native iOS Phase 1 project remains in the repository, but active work now uses a browser-first prototype. This lets Codex and the user inspect and tune the game feel on Windows before migrating the validated direction to Godot and then mobile builds.

See `WEB_PROTOTYPE.md`.

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
- 2026-05-13: Added minimal Xcode iOS project, SwiftUI app entry, SpriteKit room scene, core models, CoreData-backed persistence service, default game state, and game view model.
- 2026-05-13: Build could not be run in this Windows environment because `xcodebuild` and `swift` are not installed.
- 2026-05-13: Pivoted to Web-1 prototype so room, light, shadow, furniture, memory, and prompt feel can be tested locally in Codex.

## Phase 1 Files Created

- `ShadowNursery.xcodeproj/project.pbxproj`
- `ShadowNursery/App/ShadowNurseryApp.swift`
- `ShadowNursery/App/AppDelegate.swift`
- `ShadowNursery/Models/ShadowStage.swift`
- `ShadowNursery/Models/ShadowState.swift`
- `ShadowNursery/Models/FurnitureState.swift`
- `ShadowNursery/Models/MemoryFragment.swift`
- `ShadowNursery/Models/ShadowPrompt.swift`
- `ShadowNursery/Models/StateEffect.swift`
- `ShadowNursery/Models/RoomState.swift`
- `ShadowNursery/Models/GameState.swift`
- `ShadowNursery/Systems/PersistenceService.swift`
- `ShadowNursery/ViewModels/GameViewModel.swift`
- `ShadowNursery/Views/RoomView.swift`
- `ShadowNursery/SpriteKit/RoomScene.swift`
- `ShadowNursery/Content/DefaultGameState.swift`

## Build Check

Run this on macOS with Xcode installed:

```text
xcodebuild -project ShadowNursery.xcodeproj -scheme ShadowNursery -destination 'platform=iOS Simulator,name=iPhone 15' build
```

If the simulator name differs, list available simulators with:

```text
xcrun simctl list devices
```

## Next Codex Prompt

```text
Read AGENTS.md, PHASE_CURRENT.md, SCHEMA.md, CONTENT.md, and WEB_PROTOTYPE.md first. Continue Web-1 until the playable feel is ready for user judgment. Do not start Godot until the prototype direction is approved.
```
