# Phase Current

Project: Shadow Nursery

Status: Phase 1 implementation complete; Xcode build verification pending

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
- 2026-05-13: Added minimal Xcode iOS project, SwiftUI app entry, SpriteKit room scene, core models, CoreData-backed persistence service, default game state, and game view model.
- 2026-05-13: Build could not be run in this Windows environment because `xcodebuild` and `swift` are not installed.

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
Read AGENTS.md, PHASE_CURRENT.md, SCHEMA.md, and CONTENT.md first. Verify Phase 1 in Xcode. Fix any build issues. Only after Phase 1 builds and launches, begin Phase 2.
```
