import Foundation

struct GameState: Codable, Equatable {
    var shadow: ShadowState
    var furniture: [FurnitureState]
    var memories: [MemoryFragment]
    var prompts: [ShadowPrompt]
    var rooms: [RoomState]
    var currentRoomID: RoomID
    var lastPromptShownAt: Date?
    var sessionCount: Int
    var hasSeenIntro: Bool
    var isFirstLaunch: Bool
    var appVersion: String
}

