# Schema

This is the compact implementation reference for Shadow Nursery.

## Target

- Platform: iOS 16+
- Language: Swift 5.9+
- UI: SwiftUI
- Scene rendering: SpriteKit
- Persistence: CoreData for full build
- Network: none
- Third-party dependencies: avoid unless unavoidable

## Core Models

### ShadowState

- `size: Double`
- `distortion: Double`
- `calmness: Double`
- `familiarity: Double`
- `unease: Double`
- `stage: ShadowStage`
- `memoryCount: Int`
- `totalObservations: Int`
- `lastObservedAt: Date`
- `firstSeenAt: Date`
- `totalMinutesObserved: Double`

All Double values must be clamped to `0...100`.

### ShadowStage

- `dormant`
- `aware`
- `present`
- `familiar`
- `watching`
- `unknown`

Stage is calculated, never manually set by the player.

### Furniture

Furniture IDs:

- `chair`
- `table`
- `lamp`
- `bookshelf`
- `curtain`
- `mirrorFragment`

Furniture positions:

- `nearCorner`
- `center`
- `againstWall`
- `removed`

### Rooms

Room IDs:

- `mainRoom`
- `hallway`
- `childRoom`
- `emptyRoom`

Ambient moods:

- `warm`
- `dim`
- `cold`
- `dark`

### GameState

Root save model:

- `shadow`
- `furniture`
- `memories`
- `prompts`
- `rooms`
- `currentRoomID`
- `lastPromptShownAt`
- `sessionCount`
- `hasSeenIntro`
- `isFirstLaunch`
- `appVersion`

## Systems

Implement in phase order.

- `ShadowGrowthSystem`
- `StageSystem`
- `MemoryUnlockSystem`
- `PromptSystem`
- `PersistenceService`
- `HapticsService`
- `AudioService`
- `NotificationService`

## Folder Structure

```text
ShadowNursery/
  App/
  Models/
  Systems/
  ViewModels/
  Views/
  SpriteKit/
  Content/
  Resources/
```

## Important Architecture Rules

- Keep game logic out of SwiftUI views.
- Save after state-changing interactions.
- Do not save every frame.
- Provide fallback default state if loading fails.
- Do not crash on persistence failure.
- Do not expose numeric stats in user-facing UI.
- Do not explain the shadow.

