import Foundation

enum DefaultGameState {
    static func make(now: Date = Date(), appVersion: String = "0.1.0") -> GameState {
        GameState(
            shadow: ShadowState(
                size: 12,
                distortion: 0,
                calmness: 55,
                familiarity: 0,
                unease: 5,
                stage: .dormant,
                memoryCount: 0,
                totalObservations: 0,
                lastObservedAt: now,
                firstSeenAt: now,
                totalMinutesObserved: 0
            ),
            furniture: [
                FurnitureState(id: .chair, position: .againstWall, isPresent: true),
                FurnitureState(id: .table, position: .center, isPresent: true),
                FurnitureState(id: .lamp, position: .againstWall, isPresent: true),
                FurnitureState(id: .bookshelf, position: .removed, isPresent: false),
                FurnitureState(id: .curtain, position: .removed, isPresent: false),
                FurnitureState(id: .mirrorFragment, position: .removed, isPresent: false)
            ],
            memories: [], // TODO(phase 6): Populate from MemoryContent.
            prompts: [], // TODO(phase 7): Populate from PromptContent.
            rooms: [
                RoomState(
                    id: .mainRoom,
                    isUnlocked: true,
                    unlockedAt: now,
                    lightAngle: 50,
                    lightIntensity: 45,
                    ambientMood: .warm
                ),
                RoomState(
                    id: .hallway,
                    isUnlocked: false,
                    unlockedAt: nil,
                    lightAngle: 50,
                    lightIntensity: 35,
                    ambientMood: .cold
                ),
                RoomState(
                    id: .childRoom,
                    isUnlocked: false,
                    unlockedAt: nil,
                    lightAngle: 50,
                    lightIntensity: 30,
                    ambientMood: .dim
                ),
                RoomState(
                    id: .emptyRoom,
                    isUnlocked: false,
                    unlockedAt: nil,
                    lightAngle: 50,
                    lightIntensity: 20,
                    ambientMood: .dark
                )
            ],
            currentRoomID: .mainRoom,
            lastPromptShownAt: nil,
            sessionCount: 0,
            hasSeenIntro: false,
            isFirstLaunch: true,
            appVersion: appVersion
        )
    }
}

